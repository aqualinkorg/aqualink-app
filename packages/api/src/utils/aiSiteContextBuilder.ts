import { DataSource, In, MoreThan } from 'typeorm';
import { Site } from '../sites/sites.entity';
import { DailyData } from '../sites/daily-data.entity';
import { LatestData } from '../time-series/latest-data.entity';
import { Survey } from '../surveys/surveys.entity';
import { ReefCheckSurvey } from '../reef-check-surveys/reef-check-surveys.entity';
import { ForecastData } from '../wind-wave-data/forecast-data.entity';
import { TimeSeries } from '../time-series/time-series.entity';
import { Metric } from '../time-series/metrics.enum';
import { SourceType } from '../sites/schemas/source-type.enum';

interface LatestDataItem {
  id: number;
  timestamp: Date; // Changed from string to Date
  value: number;
  source: string;
  metric: string;
  siteId: number;
}

interface DailyDataItem {
  date: Date; // Changed from string to Date
  satelliteTemperature: number | null;
  degreeHeatingDays: number | null;
  dailyAlertLevel: number;
  weeklyAlertLevel: number;
}

/**
 * Extract metrics from latest_data API response
 */
function extractMetrics(latestData: LatestDataItem[]): Record<string, number> {
  return latestData.reduce(
    (acc, item) => ({
      ...acc,
      [item.metric]: item.value,
    }),
    {} as Record<string, number>,
  );
}

/**
 * Calculate temperature trend from last 7 days
 */
function calculateTrend(dailyData: DailyDataItem[]): string {
  if (!dailyData || dailyData.length < 7) return 'stable';
  const recent = dailyData.slice(0, 7);
  const oldest = recent[recent.length - 1].satelliteTemperature;
  const newest = recent[0].satelliteTemperature;
  if (!oldest || !newest) return 'stable';
  const change = newest - oldest;
  if (change > 0.3) return 'increasing';
  if (change < -0.3) return 'cooling';
  return 'stable';
}

/**
 * Main function to build site context
 */
export async function buildSiteContext(
  siteId: number,
  dataSource: DataSource,
): Promise<string> {
  try {
    // Helper to safely format numbers
    const formatNumber = (
      value: number | null | undefined,
      decimals = 2,
    ): string => {
      return typeof value === 'number' && Number.isFinite(value)
        ? value.toFixed(decimals)
        : 'Unknown';
    };

    // Query database directly using TypeORM
    const siteRepository = dataSource.getRepository(Site);
    const dailyDataRepository = dataSource.getRepository(DailyData);
    const latestDataRepository = dataSource.getRepository(LatestData);

    const [
      siteData,
      latestDataArray,
      dailyData,
      surveys,
      reefCheckSurveys,
      windWaveData,
      huiWaterQualityData,
    ] = await Promise.all([
      siteRepository.findOne({
        where: { id: siteId },
        relations: ['region'],
      }),
      latestDataRepository.find({
        where: { site: { id: siteId } },
      }),
      dailyDataRepository.find({
        where: { site: { id: siteId } },
        order: { date: 'DESC' },
        take: 90,
      }),
      dataSource.getRepository(Survey).find({
        where: { site: { id: siteId } },
        order: { diveDate: 'DESC' },
        relations: ['surveyMedia'],
      }),
      dataSource.getRepository(ReefCheckSurvey).find({
        where: { site: { id: siteId } },
        order: { date: 'DESC' },
        relations: ['organisms', 'substrates'],
      }),
      // Only query wind/wave hindcast if site has it
      (async () => {
        const hasHindcast = await dataSource.getRepository(ForecastData).count({
          where: { site: { id: siteId } },
          take: 1,
        });

        if (hasHindcast === 0) return [];

        return dataSource.getRepository(ForecastData).find({
          where: { site: { id: siteId } },
          order: { timestamp: 'DESC' },
        });
      })(),
      dataSource.getRepository(TimeSeries).find({
        where: {
          source: { site: { id: siteId }, type: In(['spotter']) },
          metric: In([Metric.TOP_TEMPERATURE, Metric.BOTTOM_TEMPERATURE]),
        },
        order: { timestamp: 'DESC' },
        take: 200,
        relations: ['source'],
      }),
      // NEW: Query HUI water quality data - ONLY if site has HUI data
      (async () => {
        // Check if site has any HUI data first
        const hasHuiData = await latestDataRepository.findOne({
          where: {
            site: { id: siteId },
            source: SourceType.HUI,
          },
        });

        if (!hasHuiData) {
          return []; // Return empty array if no HUI data
        }

        // Only query if HUI data exists
        return dataSource.getRepository(TimeSeries).find({
          where: {
            source: { site: { id: siteId }, type: SourceType.HUI },
            metric: In([
              Metric.NITROGEN_TOTAL,
              Metric.PHOSPHORUS_TOTAL,
              Metric.PHOSPHORUS,
              Metric.SILICATE,
              Metric.NNN, // nitrate_plus_nitrite
              Metric.AMMONIUM,
              Metric.ODO_SATURATION,
              Metric.ODO_CONCENTRATION,
              Metric.SALINITY,
              Metric.TURBIDITY,
              Metric.PH,
            ]),
            timestamp: MoreThan(
              new Date(Date.now() - 2 * 365 * 24 * 60 * 60 * 1000),
            ),
          },
          order: { timestamp: 'DESC' },
          take: 2000,
          relations: ['source'],
        });
      })(),
    ]);

    if (!siteData) {
      throw new Error(`Site with ID ${siteId} not found`);
    }

    // Transform latestData to match expected structure
    const latestData = { latestData: latestDataArray };

    // Extract metrics from latest_data
    const metrics = extractMetrics(latestData.latestData);

    // Extract coordinates (handle Point type)
    const lat =
      siteData.polygon?.type === 'Point'
        ? siteData.polygon.coordinates[1]?.toFixed(4)
        : 'Unknown';
    const lon =
      siteData.polygon?.type === 'Point'
        ? siteData.polygon.coordinates[0]?.toFixed(4)
        : 'Unknown';

    // Calculate values with exact precision
    const temp = metrics.satellite_temperature;
    const anomaly = metrics.sst_anomaly;
    const { dhw } = metrics;
    const mmm = siteData.maxMonthlyMean ?? undefined;
    const tempDiff =
      typeof temp === 'number' && typeof mmm === 'number'
        ? temp - mmm
        : undefined;
    const tempDiffFormatted = (() => {
      if (typeof tempDiff !== 'number') return 'Unknown';
      return tempDiff > 0 ? `+${tempDiff.toFixed(2)}` : tempDiff.toFixed(2);
    })();
    const tempVs = (() => {
      if (typeof tempDiff !== 'number') return 'UNKNOWN';
      return tempDiff > 0 ? 'ABOVE' : 'BELOW';
    })();

    // Get Degree Heating Days from daily_data (most recent day)
    const degreeHeatingDays = dailyData?.[0]?.degreeHeatingDays ?? 0;

    // Calculate trend from daily data
    const trend = calculateTrend(dailyData as DailyDataItem[]);

    // Alert level names
    const alertLevelNames: Record<number, string> = {
      0: 'No Alert',
      1: 'Watch',
      2: 'Warning',
      3: 'Alert Level 1',
      4: 'Alert Level 2',
    };

    const weeklyAlertName =
      alertLevelNames[Number(metrics.temp_weekly_alert)] || 'Unknown';
    const dailyAlertName =
      alertLevelNames[Number(metrics.temp_alert)] || 'Unknown';

    // Bleaching likelihood based on DHW
    const bleachingLikelihood = (() => {
      if (typeof dhw !== 'number') return 'unknown';
      if (dhw >= 4) return 'very high - severe bleaching likely';
      if (dhw >= 3) return 'high - significant bleaching likely';
      if (dhw >= 2) return 'moderate - bleaching possible';
      if (dhw >= 1) return 'low - bleaching unlikely but watch closely';
      return 'low';
    })();

    // Check for Spotter/Smart Buoy
    const hasSpotter =
      siteData.sensorId !== null && siteData.sensorId !== undefined;

    // Get current date in ISO format
    const currentDate = new Date().toISOString().split('T')[0];

    // Format the complete context
    return `
## SITE INFORMATION
- **Site ID**: ${siteData.id}
- **Site Name**: ${siteData.name}
- **Location**: ${siteData.region?.name || 'Unknown region'}
- **Coordinates**: Latitude ${lat}, Longitude ${lon}
- **Depth**: ${siteData.depth || 'Unknown'}m
${hasSpotter ? `- **Sensor Status**: Smart Buoy is deployed at this site` : ''}
- **Data Source**: ${
      hasSpotter ? 'Spotter Smart Buoy' : 'NOAA Satellite (Coral Reef Watch)'
    }

## CURRENT REEF METRICS (as of ${currentDate})

### Temperature Data
${
  hasSpotter && (metrics.top_temperature || metrics.bottom_temperature)
    ? `**SPOTTER DATA (Most Accurate - Live In-Situ Readings):**
- **Top Temperature** (1m depth): ${formatNumber(metrics.top_temperature)}°C
- **Bottom Temperature** (${siteData.depth || '?'}m depth): ${formatNumber(
        metrics.bottom_temperature,
      )}°C
- **Data Source**: Spotter Smart Buoy (real-time sensor)

**SATELLITE DATA (for comparison):**
- **Sea Surface Temperature (SST)**: ${formatNumber(temp)}°C
- **Note**: Spotter data is more accurate. Satellite measures surface only.`
    : `**SATELLITE DATA:**
- **Sea Surface Temperature (SST)**: ${formatNumber(temp)}°C
- **Data Source**: NOAA Satellite (Coral Reef Watch)`
}
- **Historical Maximum (MMM)**: ${formatNumber(mmm)}°C
- **Temperature Difference from MMM**: ${tempDiffFormatted}°C
- **SST Anomaly**: ${
      typeof anomaly === 'number'
        ? `${anomaly > 0 ? '+' : ''}${anomaly.toFixed(2)}`
        : 'Unknown'
    }°C
- **7-Day Trend**: ${trend}

### Heat Stress Metrics
- **Degree Heating Weeks (DHW)**: ${formatNumber(dhw)}
- **Degree Heating Days**: ${formatNumber(degreeHeatingDays, 0)}
- **Accumulated Stress**: ${bleachingLikelihood}

### Alert Levels
- **Weekly Alert Level**: ${
      typeof metrics.temp_weekly_alert === 'number'
        ? metrics.temp_weekly_alert
        : 'Unknown'
    } (${weeklyAlertName}) ← PRIMARY - Use this for dashboard display
- **Daily Alert Level**: ${
      typeof metrics.temp_alert === 'number' ? metrics.temp_alert : 'Unknown'
    } (${dailyAlertName}) ← Can mention as additional context

**IMPORTANT**: 
- Always reference the **Weekly Alert Level** first - this matches the dashboard display
- Weekly alert is smoothed over 7 days and more stable
- Daily alert can fluctuate more but shows day-to-day changes

### Alert Level Meanings
- **0 (No Alert)**: DHW < 1, no bleaching risk
- **1 (Watch)**: DHW 1, bleaching possible, increase monitoring
- **2 (Warning)**: DHW 2, bleaching likely, intensive monitoring
- **3 (Alert Level 1)**: DHW 3, severe bleaching likely, emergency response
- **4 (Alert Level 2)**: DHW 4, severe bleaching and mortality likely, critical emergency

## HISTORICAL DATA (Last 90 Days)
${dailyData
  .slice(0, 90)
  .map(
    (day) =>
      `- ${day.date.toISOString().split('T')[0]}: ${formatNumber(
        day.satelliteTemperature,
      )}°C, DHW: ${formatNumber(
        (day.degreeHeatingDays ?? 0) / 7,
      )}, Weekly Alert: ${day.weeklyAlertLevel}`,
  )
  .join('\n')}

**Instructions for using historical data:**
- When user asks "What was the temperature on [date]?", find that date in the list above
- Use EXACT values from the historical data - don't estimate
- If date not found, say "Data not available for that specific date"

## SURVEY DATA

### Aqualink Surveys
${
  surveys.length > 0
    ? surveys
        .map(
          (s) =>
            `- **${s.diveDate.toISOString().split('T')[0]}**: Weather: ${
              s.weatherConditions
            }, Temp: ${s.temperature ? `${s.temperature}°C` : 'N/A'}${
              s.comments ? `, Notes: ${s.comments.substring(0, 100)}` : ''
            }${
              s.surveyMedia && s.surveyMedia.length > 0
                ? ` (${s.surveyMedia.length} images)`
                : ''
            }`,
        )
        .join('\n')
    : '- No Aqualink surveys uploaded yet'
}

### Reef Check Surveys
${
  reefCheckSurveys.length > 0
    ? reefCheckSurveys
        .map((rc) => {
          const fishData = rc.organisms
            ?.filter((o) => o.type === 'Fish' && o.s1 + o.s2 + o.s3 + o.s4 > 0)
            .map((o) => `${o.organism}: ${o.s1 + o.s2 + o.s3 + o.s4}`)
            .join(', ');

          const impactData = rc.organisms
            ?.filter(
              (o) => o.type === 'Impact' && o.s1 + o.s2 + o.s3 + o.s4 > 0,
            )
            .map((o) => `${o.organism}: ${o.s1 + o.s2 + o.s3 + o.s4}`)
            .join(', ');

          return `- **${
            rc.date?.toISOString().split('T')[0] || 'Unknown date'
          }**: Depth: ${rc.depth}m, Water temp: ${rc.waterTempAtSurface}°C${
            rc.overallAnthroImpact
              ? `, Overall impact: ${rc.overallAnthroImpact}`
              : ''
          }${fishData ? `\n  Fish: ${fishData}` : ''}${
            impactData ? `\n  Impacts: ${impactData}` : ''
          }`;
        })
        .join('\n')
    : '- No Reef Check surveys available'
}

**When asked about surveys:**
- Reference specific dates and observations from above
- For Reef Check data, check if surveys exist before saying "no data"
- Mention that users can view full survey details on the dashboard

## WIND & WAVE DATA

${(() => {
  const hasSpotterWindWave =
    hasSpotter &&
    (metrics.wind_speed ||
      metrics.significant_wave_height ||
      metrics.wave_mean_period);

  const formatHindcast = () => {
    if (windWaveData.length === 0) return '- No hindcast data available';
    
    const latestByMetric = windWaveData.reduce(
      (acc, item) => {
        if (
          !acc[item.metric] ||
          new Date(item.timestamp) > new Date(acc[item.metric].timestamp)
        ) {
          return { ...acc, [item.metric]: item };
        }
        return acc;
      },
      {} as Record<string, (typeof windWaveData)[0]>,
    );

    return Object.entries(latestByMetric)
      .map(
        ([metric, data]) =>
          `- **${metric.replace(/_/g, ' ')}**: ${data.value.toFixed(2)} (${
            data.source
          }, ${data.timestamp.toISOString().split('T')[0]})`,
      )
      .join('\n');
  };

  if (hasSpotterWindWave) {
    return `**SPOTTER DATA (Real-Time Buoy Readings):**
${
  metrics.wind_speed
    ? `- **Wind Speed**: ${formatNumber(metrics.wind_speed, 2)} m/s`
    : ''
}
${
  metrics.wind_direction
    ? `- **Wind Direction**: ${formatNumber(metrics.wind_direction, 0)}°`
    : ''
}
${
  metrics.significant_wave_height
    ? `- **Wave Height**: ${formatNumber(metrics.significant_wave_height, 2)} m`
    : ''
}
${
  metrics.wave_mean_period
    ? `- **Wave Period**: ${formatNumber(metrics.wave_mean_period, 2)} s`
    : ''
}
${
  metrics.wave_mean_direction
    ? `- **Wave Direction**: ${formatNumber(metrics.wave_mean_direction, 0)}°`
    : ''
}
- **Data Source**: Spotter Smart Buoy (live sensor)

**HINDCAST DATA (for comparison/history):**
${formatHindcast()}`;
  }

  if (windWaveData.length > 0) {
    return `**HINDCAST DATA:**
${formatHindcast()}`;
  }

  return '- No wind/wave data available';
})()}

## WATER QUALITY DATA
${(() => {
  // Define all possible water quality metrics with their configurations
  const waterQualityMetrics: Record<
    string,
    { unit: string; label: string; source: string }
  > = {
    // Nutrients (HUI)
    phosphorus: { unit: 'µg/L', label: 'Phosphorus (PO₄)', source: 'hui' },
    phosphorus_total: {
      unit: 'µg/L',
      label: 'Total Phosphorus',
      source: 'hui',
    },
    nitrogen_total: { unit: 'µg/L', label: 'Total Nitrogen', source: 'hui' },
    nitrate_plus_nitrite: {
      unit: 'µg/L',
      label: 'Nitrate + Nitrite Nitrogen',
      source: 'hui',
    },
    ammonium: { unit: 'µg/L', label: 'Ammonium (NH₄)', source: 'hui' },
    silicate: { unit: 'µg/L', label: 'Silicate', source: 'hui' },

    // Physical/Chemical (both HUI and SONDE)
    ph: { unit: '', label: 'pH', source: 'both' },
    salinity: { unit: 'ppt', label: 'Salinity', source: 'both' },
    turbidity: { unit: 'NTU', label: 'Turbidity', source: 'both' },

    // Dissolved Oxygen (both HUI and SONDE)
    odo_concentration: {
      unit: 'mg/L',
      label: 'Dissolved Oxygen (DO)',
      source: 'both',
    },
    odo_saturation: { unit: '%', label: 'DO Saturation', source: 'both' },

    // SONDE-specific metrics
    ph_mv: { unit: 'mV', label: 'pH (millivolts)', source: 'sonde' },
    conductivity: { unit: 'µS/cm', label: 'Conductivity', source: 'sonde' },
    specific_conductance: {
      unit: 'µS/cm',
      label: 'Specific Conductance',
      source: 'sonde',
    },
    tds: { unit: 'mg/L', label: 'Total Dissolved Solids', source: 'sonde' },
    total_suspended_solids: {
      unit: 'mg/L',
      label: 'Total Suspended Solids',
      source: 'sonde',
    },
    cholorophyll_concentration: {
      unit: 'µg/L',
      label: 'Chlorophyll',
      source: 'sonde',
    },
    water_depth: { unit: 'm', label: 'Water Depth', source: 'sonde' },
  };

  // Extract SONDE metrics from latest_data (already in context)
  const sondeMetrics = latestDataArray.filter(
    (item) => item.source === 'sonde' && item.metric !== 'bottom_temperature',
  );

  // Format SONDE data
  const sondeData = sondeMetrics
    .map((item) => {
      const config = waterQualityMetrics[item.metric];
      if (!config) return null;

      const value =
        typeof item.value === 'number'
          ? formatNumber(item.value, 2)
          : 'Unknown';
      return {
        label: config.label,
        value: `${value}${config.unit ? ` ${config.unit}` : ''}`,
        timestamp: item.timestamp,
      };
    })
    .filter((d): d is NonNullable<typeof d> => d !== null);

  // Format HUI data - get ALL values for each metric (last 2 years)
  const huiDataByMetric = huiWaterQualityData.reduce(
    (acc, reading) => {
      const metricData = acc[reading.metric] || [];
      return {
        ...acc,
        [reading.metric]: [
          ...metricData,
          {
            value: reading.value,
            timestamp: reading.timestamp,
          },
        ],
      };
    },
    {} as Record<string, Array<{ value: number; timestamp: Date }>>,
  );

  // Sort each metric's data by timestamp (newest first) - immutable
  const sortedHuiDataByMetric = Object.entries(huiDataByMetric).reduce(
    (acc, [metric, dataPoints]) => ({
      ...acc,
      // eslint-disable-next-line fp/no-mutating-methods
      [metric]: [...dataPoints].sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      ),
    }),
    {} as Record<string, Array<{ value: number; timestamp: Date }>>,
  );

  const huiData = Object.entries(sortedHuiDataByMetric)
    .map(([metric, dataPoints]) => {
      const config = waterQualityMetrics[metric];
      if (!config || dataPoints.length === 0) return null;

      // Format all data points for this metric
      const formattedData = dataPoints.map((point) => ({
        value:
          typeof point.value === 'number'
            ? formatNumber(point.value, 2)
            : 'Unknown',
        timestamp: point.timestamp,
      }));

      return {
        label: config.label,
        unit: config.unit,
        data: formattedData,
        latestValue: formattedData[0]?.value || 'Unknown',
        latestTimestamp: formattedData[0]?.timestamp || new Date(),
      };
    })
    .filter((d): d is NonNullable<typeof d> => d !== null);

  // Combine and format output
  if (sondeData.length === 0 && huiData.length === 0) {
    return '- No water quality data available';
  }

  const sondeSection =
    sondeData.length > 0
      ? `**SONDE Data:**
${sondeData.map((d) => `- **${d.label}**: ${d.value}`).join('\n')}
- **Sample Date**: ${
          sondeData[0]?.timestamp
            ? new Date(sondeData[0].timestamp).toISOString().split('T')[0]
            : 'Unknown'
        }`
      : null;

  const huiSection =
    huiData.length > 0
      ? (() => {
          const totalDataPoints = huiData.reduce(
            (sum, m) => sum + m.data.length,
            0,
          );

          const turbidityMetric = huiData.find((d) => d.label === 'Turbidity');
          const nitrateMetric = huiData.find(
            (d) => d.label === 'Nitrate + Nitrite Nitrogen',
          );

          const turbidityInterpretation = turbidityMetric
            ? (() => {
                const turbValue = parseFloat(turbidityMetric.latestValue);
                if (Number.isNaN(turbValue)) return null;

                const count = `${turbidityMetric.data.length} measurements available for trend analysis.`;
                if (turbValue >= 10)
                  return `- Turbidity: ALERT level (≥10) - Poor water clarity. ${count}`;
                if (turbValue >= 5)
                  return `- Turbidity: WARNING level (5-10) - Elevated sediment. ${count}`;
                if (turbValue >= 1)
                  return `- Turbidity: WATCH level (1-5) - Slightly elevated. ${count}`;
                return `- Turbidity: Good (<1) - Clear water. ${count}`;
              })()
            : null;

          const nitrateInterpretation = nitrateMetric
            ? (() => {
                const nitrateValue = parseFloat(nitrateMetric.latestValue);
                if (Number.isNaN(nitrateValue)) return null;

                const count = `${nitrateMetric.data.length} measurements available.`;
                if (nitrateValue >= 100)
                  return `- Nitrate+Nitrite Nitrogen: ALERT level (≥100) - High pollution risk. ${count}`;
                if (nitrateValue >= 30)
                  return `- Nitrate+Nitrite Nitrogen: WARNING level (30-100) - Elevated nutrients. ${count}`;
                if (nitrateValue >= 3.5)
                  return `- Nitrate+Nitrite Nitrogen: WATCH level (3.5-30) - Slightly elevated. ${count}`;
                return `- Nitrate+Nitrite Nitrogen: Good (<3.5) - Low nutrient pollution. ${count}`;
              })()
            : null;

          const interpretations = [
            turbidityInterpretation,
            nitrateInterpretation,
          ]
            .filter(Boolean)
            .join('\n');

          return `**HUI Data (Hui O Ka Wai Ola - Maui only):**
**Latest values** (${totalDataPoints} total measurements across ${
            huiData.length
          } metrics from past 2 years):
${huiData
  .map(
    (d) =>
      `- **${d.label}**: ${d.latestValue}${d.unit ? ` ${d.unit}` : ''} (${
        new Date(d.latestTimestamp).toISOString().split('T')[0]
      })`,
  )
  .join('\n')}

**HUI Water Quality Thresholds:**
- **Turbidity (NTU)**: Watch: 1 | Warning: 5 | Alert: 10
- **Nitrate + Nitrite Nitrogen (µg/L)**: Watch: 3.5 | Warning: 30 | Alert: 100

**Interpreting current levels:**
${
  interpretations ||
  '- Thresholds apply to turbidity and nitrate+nitrite nitrogen metrics'
}

**Note**: AI can analyze trends across all ${totalDataPoints} data points from the past 2 years.`;
        })()
      : null;

  const allSections = [sondeSection, huiSection].filter(Boolean);

  return `${allSections.join('\n\n')}

**Note**: This is uploaded batch data, not real-time monitoring.`;
})()}

## HISTORICAL DATA AVAILABILITY (Time Series Range)
- Check /time-series/sites/{siteId}/range endpoint for detailed historical data availability
- This includes HOBO loggers, water quality sensors, and other uploaded data
- View date ranges and data types on the dashboard time-series charts

## DATA ACCURACY REQUIREMENTS - CRITICAL
✅ **USE THESE EXACT VALUES** in your response - they come directly from the database
✅ **DO NOT ROUND** beyond the precision shown (2 decimals for temp, DHW)
✅ **DO NOT ESTIMATE OR HALLUCINATE** - if a value is missing, say "data unavailable"
✅ **ALWAYS CITE**: "According to ${
      hasSpotter ? 'Smart Buoy' : 'NOAA satellite'
    } data as of ${currentDate}..."
✅ **TEMPERATURE FORMAT**: Always show as ±X.XX°C with + or - sign (e.g., +1.10°C or -0.50°C)
✅ **NO GUESSING**: If you don't see a value in the CURRENT REEF METRICS section above, you MUST NOT make one up
✅ **ANSWER DIRECTLY**: Provide the requested data without mentioning sensors that are NOT deployed unless specifically asked about accuracy, data quality, or how the user can improve

## CONTEXT FOR AI INTERPRETATION
- **Current DHW of ${formatNumber(dhw)}** means: ${bleachingLikelihood}
- **Temperature is ${tempVs} historical maximum** by ${
      typeof tempDiff === 'number' ? Math.abs(tempDiff).toFixed(2) : 'Unknown'
    }°C
- **Trend**: Temperature is ${trend} over the past 7 days
- This is a **${
      hasSpotter
        ? 'high-accuracy in-situ measurement'
        : 'satellite-derived surface measurement'
    }**
`.trim();
  } catch (error) {
    // Handle errors gracefully
    if (error instanceof Error) {
      throw new Error(`Failed to fetch site data: ${error.message}`);
    }
    throw error;
  }
}
