import { IsNull, Repository } from 'typeorm';
import { Site } from '../sites/sites.entity';
import { SourceType } from '../sites/schemas/source-type.enum';
import { Sources } from '../sites/sources.entity';
import { TimeSeriesValueDto } from '../time-series/dto/time-series-value.dto';
import { TimeSeries } from '../time-series/time-series.entity';
import { getDefaultDates } from './dates';
import { Metric } from '../time-series/metrics.enum';

interface TimeSeriesGroupable {
  metric: Metric;
  source: SourceType;
  depth: number | null;
  surveyPointId?: number;
  surveyPointName?: string;
}

export type TimeSeriesData = TimeSeriesGroupable & {
  value: number;
  timestamp: Date;
};

export type TimeSeriesRange = TimeSeriesGroupable & {
  maxDate: Date;
  minDate: Date;
};

interface SurveyPoint {
  id: number;
  name: string;
}

type TimeSeriesResponse<T> = Partial<
  Record<
    Metric,
    { type: SourceType; depth: number; surveyPoint?: SurveyPoint; data: T[] }[]
  >
>;

// TODO: Revisit the response structure and simplify when we have more metrics and sources available
export const groupByMetricAndSource = <T extends TimeSeriesGroupable>(
  data: T[],
): TimeSeriesResponse<
  Omit<T, 'metric' | 'source' | 'surveyPointId' | 'surveyPointName' | 'depth'>
> => {
  const groupedByMetricMap = new Map<Metric, T[]>();
  data.forEach((x) => {
    const item = groupedByMetricMap.get(x.metric);
    if (item !== undefined) {
      groupedByMetricMap.set(x.metric, [...item, x]);
    } else {
      groupedByMetricMap.set(x.metric, [x]);
    }
  });

  const entries = Array.from(groupedByMetricMap.entries());

  const groupedByPointTypeDepth = entries.map(([key, val]) => {
    const groupByMap = new Map<string, T[]>();
    val.forEach((x) => {
      const groupByKey = `${x.surveyPointId}_${x.source}_${x.depth}`;
      const item = groupByMap.get(groupByKey);
      if (item !== undefined) {
        groupByMap.set(groupByKey, [...item, x]);
      } else {
        groupByMap.set(groupByKey, [x]);
      }
    });

    const values = Array.from(groupByMap.values());
    const formatted = values.map((raw) => {
      const omittedBy = raw.map((x) => {
        const {
          metric,
          source,
          surveyPointId,
          surveyPointName,
          depth,
          ...rest
        } = x;
        return rest;
      });

      // all items should have the same source, pointId and depth, since we grouped them
      const item = raw[0];

      // this should never happen
      if (!item) throw new Error('Empty set of (source, pointId, depth)');

      return {
        type: item.source,
        depth: item.depth,
        surveyPoint: { id: item.surveyPointId, name: item.surveyPointName },
        data: omittedBy,
      };
    });

    return [key, formatted];
  });

  return Object.fromEntries(groupedByPointTypeDepth);
};

export const getAvailableMetricsQuery = ({
  timeSeriesRepository,
  siteId,
  start: startDate,
  end: endDate,
  surveyPointId,
  metrics,
}: {
  timeSeriesRepository: Repository<TimeSeries>;
  siteId: number;
  start?: string;
  end?: string;
  surveyPointId?: number;
  metrics: Metric[];
}) => {
  const { sql: surveyPointConditionSql, params: surveyPointConditionParams } =
    surveyPointId
      ? {
          sql: 'AND (source.survey_point_id = :surveyPointId OR source.survey_point_id IS NULL)',
          params: { surveyPointId },
        }
      : { sql: '', params: {} };

  const query = timeSeriesRepository
    .createQueryBuilder('time_series')
    .select('metric')
    .addSelect('source.type', 'source')
    .addSelect('source.depth', 'depth')
    .distinct(true)
    .innerJoin(
      'time_series.source',
      'source',
      `source.site_id = :siteId ${surveyPointConditionSql}`,
      { siteId, ...surveyPointConditionParams },
    )
    .leftJoin('source.surveyPoint', 'surveyPoint');

  const withStartDate = startDate
    ? query.andWhere('timestamp >= :startDate', { startDate })
    : query;

  const withEndDate = endDate
    ? withStartDate.andWhere('timestamp <= :endDate', { endDate })
    : withStartDate;

  const withMetrics =
    metrics.length > 0
      ? withEndDate.andWhere('metric IN (:...metrics)', { metrics })
      : withEndDate;

  return withMetrics.getRawMany();
};

export const getAvailableDataDates = ({
  timeSeriesRepository,
  siteId,
  surveyPointId,
  metrics,
}: {
  timeSeriesRepository: Repository<TimeSeries>;
  siteId: number;
  surveyPointId?: number;
  metrics: Metric[];
}): Promise<{ min: Date; max: Date } | undefined> => {
  const { sql: surveyPointConditionSql, params: surveyPointConditionParams } =
    surveyPointId
      ? {
          sql: 'AND (source.survey_point_id = :surveyPointId OR source.survey_point_id IS NULL)',
          params: { surveyPointId },
        }
      : { sql: '', params: {} };

  const query = timeSeriesRepository
    .createQueryBuilder('time_series')
    .select('min("timestamp")')
    .addSelect('max("timestamp")')
    .innerJoin(
      'time_series.source',
      'source',
      `source.site_id = :siteId ${surveyPointConditionSql}`,
      { siteId, ...surveyPointConditionParams },
    )
    .leftJoin('source.surveyPoint', 'surveyPoint');

  const withMetrics =
    metrics.length > 0
      ? query.andWhere('metric IN (:...metrics)', {
          metrics,
        })
      : query;

  return withMetrics.getRawOne();
};

interface GetDataQueryParams {
  timeSeriesRepository: Repository<TimeSeries>;
  siteId: number;
  metrics: Metric[];
  start?: string;
  end?: string;
  hourly?: boolean;
  surveyPointId?: number;
  csv?: boolean;
  order?: 'ASC' | 'DESC';
}

export const getDataQuery = ({
  timeSeriesRepository,
  siteId,
  metrics,
  start,
  end,
  hourly,
  surveyPointId,
  csv = false,
  order = 'ASC',
}: GetDataQueryParams): Promise<TimeSeriesData[]> => {
  const { endDate, startDate } = csv
    ? { startDate: start, endDate: end }
    : getDefaultDates(start, end);

  const { sql: surveyPointConditionSql, params: surveyPointConditionParams } =
    surveyPointId
      ? {
          sql: 'AND (source.survey_point_id = :surveyPointId OR source.survey_point_id IS NULL)',
          params: { surveyPointId },
        }
      : { sql: '', params: {} };

  const query = timeSeriesRepository
    .createQueryBuilder('time_series')
    .select(hourly ? 'avg(value)' : 'value', 'value')
    .addSelect('metric')
    .addSelect('source.type', 'source')
    .addSelect(
      hourly ? "date_trunc('hour', timestamp)" : 'timestamp',
      'timestamp',
    )
    .addSelect('source.depth', 'depth')
    .innerJoin(
      'time_series.source',
      'source',
      `source.site_id = :siteId ${surveyPointConditionSql}`,
      { siteId, ...surveyPointConditionParams },
    )
    .leftJoin('source.surveyPoint', 'surveyPoint')
    .addSelect('surveyPoint.id', 'surveyPointId')
    .addSelect('surveyPoint.name', 'surveyPointName');

  const withStartDate = startDate
    ? query.andWhere('timestamp >= :startDate', { startDate })
    : query;

  const withEndDate = endDate
    ? withStartDate.andWhere('timestamp <= :endDate', { endDate })
    : withStartDate;

  const withMetrics =
    metrics.length > 0
      ? withEndDate.andWhere('metric IN (:...metrics)', { metrics })
      : withEndDate;

  return hourly
    ? withMetrics
        .groupBy(
          "date_trunc('hour', timestamp), metric, source.type, surveyPoint.id, source.depth",
        )
        .orderBy("date_trunc('hour', timestamp)", order)
        .getRawMany()
    : withMetrics.orderBy('timestamp', order).getRawMany();
};

export const getDataRangeQuery = (
  timeSeriesRepository: Repository<TimeSeries>,
  siteId: number,
  surveyPointId?: number,
): Promise<TimeSeriesRange[]> => {
  const hasSurveyPoint = surveyPointId !== undefined;
  const params = hasSurveyPoint ? [siteId, surveyPointId] : [siteId];
  const surveyPointCondition = hasSurveyPoint
    ? 'AND (source.survey_point_id = $2 OR source.survey_point_id IS NULL)'
    : '';

  // Drive the query from the (few) sources of the site and probe the
  // (metric, source_id, timestamp DESC) index once per metric/source pair.
  // Postgres turns each MIN/MAX into a 1-row index scan, instead of scanning
  // the whole time_series table to filter on source_id (no index leads with
  // source_id), which made this endpoint take ~10s for every site.
  return timeSeriesRepository.query(
    `SELECT
      m.metric AS "metric",
      source.type AS "source",
      source.depth AS "depth",
      MIN(r.min_date) AS "minDate",
      MAX(r.max_date) AS "maxDate",
      survey_point.id AS "surveyPointId",
      survey_point.name AS "surveyPointName"
    FROM sources source
    CROSS JOIN unnest(enum_range(NULL::time_series_metric_enum)) AS m(metric)
    CROSS JOIN LATERAL (
      SELECT MIN(ts.timestamp) AS min_date, MAX(ts.timestamp) AS max_date
      FROM time_series ts
      WHERE ts.metric = m.metric AND ts.source_id = source.id
    ) r
    LEFT JOIN site_survey_point survey_point
      ON survey_point.id = source.survey_point_id
    WHERE source.site_id = $1 ${surveyPointCondition}
      AND r.max_date IS NOT NULL
    GROUP BY m.metric, source.type, survey_point.id, source.depth
    ORDER BY MAX(r.max_date) ASC`,
    params,
  );
};

/**
 * Fetch existing NOAA sources based on the sites.
 * If the source does not exists create it.
 * @param site The site entity
 * @param sourcesRepository The repository needed to make the query
 * @returns The source found or created
 */
export const getNOAASource = async (
  site: Site,
  sourcesRepository: Repository<Sources>,
) =>
  sourcesRepository
    .findOne({
      where: {
        site: { id: site.id },
        type: SourceType.NOAA,
        surveyPoint: IsNull(),
      },
      relations: ['site', 'site.historicalMonthlyMean'],
    })
    .then((source) => {
      // If source exists return it
      if (source) {
        return source;
      }

      // Else create it and return the created entity
      return sourcesRepository.save({
        site,
        type: SourceType.NOAA,
      });
    });

/**
 * Fetches the spotter sources based on the site.
 * If no such source exists, it creates it
 * @param sites The selected site
 * @param type The SourceType
 * @param sourceRepository The necessary repository to perform the query
 * @returns The requested source entity
 */
export const getSources = (
  sites: Site[],
  type: SourceType,
  sourceRepository: Repository<Sources>,
) =>
  sites.map((site) =>
    sourceRepository
      .findOne({
        relations: ['site'],
        where: {
          site: { id: site.id },
          surveyPoint: IsNull(),
          type,
          sensorId:
            type === SourceType.SPOTTER && site.sensorId !== null
              ? site.sensorId
              : IsNull(),
        },
      })
      .then((source) => {
        // If the source exists return it
        if (source) {
          return source;
        }

        // Else create it and return the created entity
        return sourceRepository.save({
          site,
          type,
          sensorId: type === SourceType.SPOTTER ? site.sensorId : undefined,
        });
      }),
  );

export const insertSiteDataToTimeSeries = (
  data: TimeSeriesValueDto[],
  metric: Metric,
  NOAASource: Sources,
  timeSeriesRepository: Repository<TimeSeries>,
) => {
  if (data.length === 0) {
    return null;
  }

  return timeSeriesRepository
    .createQueryBuilder('time_series')
    .insert()
    .values(
      data.map((dataPoint) => ({
        ...dataPoint,
        source: NOAASource,
        metric,
      })),
    )
    .onConflict('ON CONSTRAINT "no_duplicate_data" DO NOTHING')
    .execute();
};

export const getRandomID = (length = 7) =>
  (Math.random() + 1).toString(36).substring(length);

export const refreshMaterializedView = async (repository: Repository<any>) => {
  const id = getRandomID();
  // eslint-disable-next-line no-console
  console.time(`Refresh Materialized View ${id}`);
  await repository.query('REFRESH MATERIALIZED VIEW latest_data');
  // eslint-disable-next-line no-console
  console.timeEnd(`Refresh Materialized View ${id}`);
};
