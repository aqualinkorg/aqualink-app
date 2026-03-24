import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

export type AggregationPeriod = 'hourly' | 'daily' | 'weekly';

export interface TimeSeriesQueryParams {
  siteId: number;
  /** Metric names matching the string values in the Metric enum */
  metrics: string[];
  startDate: Date;
  endDate: Date;
  aggregation: AggregationPeriod;
  /** Cap on raw data rows sent to Grok. Summary is always computed from all rows. */
  maxRawRows?: number;
}

export interface AggregatedDataPoint {
  period: string; // ISO date string for the bucket start
  metric: string;
  avg: number | null;
  min: number | null;
  max: number | null;
  count: number;
}

export interface TimeSeriesQueryResult {
  siteId: number;
  metrics: string[];
  startDate: string;
  endDate: string;
  aggregation: AggregationPeriod;
  data: AggregatedDataPoint[];
  /** Human-readable summary the AI can quote directly */
  summary: string;
}

// Validated against the Metric enum string values.
// Prevents SQL injection via the metric parameter.
const ALLOWED_METRICS = new Set([
  // Default / Satellite
  'temp_alert',
  'temp_weekly_alert',
  'dhw',
  'satellite_temperature',
  'surface_temperature',
  'air_temperature',
  'top_temperature',
  'bottom_temperature',
  'sst_anomaly',
  // Waves & Wind
  'significant_wave_height',
  'wave_mean_period',
  'wave_peak_period',
  'wave_mean_direction',
  'wind_speed',
  'wind_direction',
  'wind_gust_speed',
  'precipitation',
  // Barometric
  'barometric_pressure_top',
  'barometric_pressure_top_diff',
  'barometric_pressure_bottom',
  // Sonde
  'cholorophyll_rfu',
  'cholorophyll_concentration',
  'conductivity',
  'specific_conductance',
  'water_depth',
  'odo_saturation',
  'odo_concentration',
  'salinity',
  'tds',
  'turbidity',
  'total_suspended_solids',
  'ph',
  'ph_mv',
  'pressure',
  'rh',
  // HUI
  'nitrogen_total',
  'phosphorus_total',
  'phosphorus',
  'silicate',
  'nitrate_plus_nitrite', // NNN — DB value is 'nitrate_plus_nitrite', not 'nnn'
  'ammonium',
  // SeapHOx
  'dissolved_oxygen',
  'internal_ph',
  'external_ph_volt',
  'internal_ph_volt',
  'ph_temperature',
  'internal_temperature',
  'relative_humidity',
]);

const SQL_ROW_SAFETY_CAP = 5000;

const DEFAULT_MAX_RAW_ROWS = 500;

const getTrend = (avgs: number[]): string => {
  if (avgs.length < 4) return 'stable';
  const half = Math.floor(avgs.length / 2);
  const recentAvg = avgs.slice(0, half).reduce((a, b) => a + b, 0) / half;
  const olderAvg = avgs.slice(half).reduce((a, b) => a + b, 0) / half;
  const delta = recentAvg - olderAvg;
  if (delta > 0.3) return 'increasing';
  if (delta < -0.3) return 'decreasing';
  return 'stable';
};

@Injectable()
export class TimeSeriesAIService {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  /**
   * Metric names are validated against the whitelist before being interpolated
   * into the SQL string. All other values use parameterised placeholders.
   */
  async queryHistoricalData(
    params: TimeSeriesQueryParams,
  ): Promise<TimeSeriesQueryResult> {
    const {
      siteId,
      metrics,
      startDate,
      endDate,
      aggregation,
      maxRawRows = DEFAULT_MAX_RAW_ROWS,
    } = params;

    if (!siteId || Number.isNaN(siteId)) {
      throw new Error('Invalid siteId');
    }

    const safeMetrics = metrics.filter((m) => ALLOWED_METRICS.has(m));
    if (safeMetrics.length === 0) {
      throw new Error(
        `No valid metrics provided. Allowed metrics: ${[...ALLOWED_METRICS].join(', ')}`,
      );
    }

    const truncMap: Record<AggregationPeriod, string> = {
      hourly: 'hour',
      daily: 'day',
      weekly: 'week',
    };
    const truncPrecision = truncMap[aggregation];

    // Metric names are validated against the whitelist above, so it is safe to
    // interpolate them as string literals in the IN clause.
    const metricLiterals = safeMetrics.map((m) => `'${m}'`).join(', ');

    const sql = `
      SELECT
        date_trunc($1, ts.timestamp)          AS period,
        ts.metric,
        ROUND(AVG(ts.value)::numeric, 4)      AS avg,
        ROUND(MIN(ts.value)::numeric, 4)      AS min,
        ROUND(MAX(ts.value)::numeric, 4)      AS max,
        COUNT(*)::int                          AS count
      FROM time_series ts
      JOIN sources s ON s.id = ts.source_id
      WHERE
        s.site_id    = $2
        AND ts.metric IN (${metricLiterals})
        AND ts.timestamp >= $3
        AND ts.timestamp <= $4
      GROUP BY
        date_trunc($1, ts.timestamp),
        ts.metric
      ORDER BY
        ts.metric,
        period DESC
      LIMIT $5
    `;

    const rows = await this.dataSource.query(sql, [
      truncPrecision,
      siteId,
      startDate,
      endDate,
      SQL_ROW_SAFETY_CAP,
    ]);

    const allData: AggregatedDataPoint[] = rows.map(
      (row: {
        period: Date;
        metric: string;
        avg: string;
        min: string;
        max: string;
        count: number;
      }) => ({
        period: row.period.toISOString(),
        metric: row.metric,
        avg: row.avg !== null ? parseFloat(row.avg) : null,
        min: row.min !== null ? parseFloat(row.min) : null,
        max: row.max !== null ? parseFloat(row.max) : null,
        count: row.count,
      }),
    );

    const summary = this.buildSummary(allData, safeMetrics, aggregation);

    // Cap the raw data array sent to Grok — the summary is what the AI
    // primarily uses, so this cap does not affect answer quality
    const data = allData.slice(0, maxRawRows);

    return {
      siteId,
      metrics: safeMetrics,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      aggregation,
      data,
      summary,
    };
  }

  private buildSummary(
    data: AggregatedDataPoint[],
    metrics: string[],
    aggregation: AggregationPeriod,
  ): string {
    if (data.length === 0) {
      return 'No data found for the requested period and metrics.';
    }

    return metrics
      .map((metric) => {
        const points = data.filter((d) => d.metric === metric);
        if (points.length === 0) return `${metric}: no data`;

        const avgs = points
          .map((p) => p.avg)
          .filter((v): v is number => v !== null);
        const mins = points
          .map((p) => p.min)
          .filter((v): v is number => v !== null);
        const maxs = points
          .map((p) => p.max)
          .filter((v): v is number => v !== null);

        if (avgs.length === 0) return null;

        const overallAvg = avgs.reduce((a, b) => a + b, 0) / avgs.length;
        const overallMin = Math.min(...mins);
        const overallMax = Math.max(...maxs);
        const oldest = points[points.length - 1].period.slice(0, 10);
        const newest = points[0].period.slice(0, 10);
        const trend = getTrend(avgs);
        const totalReadings = points.reduce((s, p) => s + p.count, 0);

        return (
          `${metric} (${aggregation}, ${oldest} to ${newest}): ` +
          `avg=${overallAvg.toFixed(3)}, min=${overallMin.toFixed(3)}, ` +
          `max=${overallMax.toFixed(3)}, trend=${trend}, ` +
          `${totalReadings} readings across ${points.length} ${aggregation} buckets`
        );
      })
      .filter((line): line is string => line !== null)
      .join('\n');
  }
}
