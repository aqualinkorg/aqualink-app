import { DataSource, In } from 'typeorm';
import { Site } from '../sites/sites.entity';
import { DailyData } from '../sites/daily-data.entity';
import { LatestData } from '../time-series/latest-data.entity';
import { Survey } from '../surveys/surveys.entity';
import { ReefCheckSurvey } from '../reef-check-surveys/reef-check-surveys.entity';
import { ForecastData } from '../wind-wave-data/forecast-data.entity';
import { TimeSeries } from '../time-series/time-series.entity';
import { Metric } from '../time-series/metrics.enum';

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
      spotterHistory,
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
      dataSource.getRepository(ForecastData).find({
        where: { site: { id: siteId } },
        order: { timestamp: 'DESC' },
      }),
      dataSource.getRepository(TimeSeries).find({
        where: {
          source: { site: { id: siteId }, type: In(['spotter', 'seaphox']) },
          metric: In([
            Metric.TOP_TEMPERATURE,
            Metric.BOTTOM_TEMPERATURE,
            'seaphox_external_ph',
            'seaphox_internal_ph',
            'seaphox_pressure',
            'seaphox_salinity',
            'seaphox_conductivity',
            'seaphox_oxygen',
            'seaphox_relative_humidity',
          ]),
        },
        order: { timestamp: 'DESC' },
        take: 200,
        relations: ['source'],
      }),
    ]);

    const seaphoxMetrics = [
      'seaphox_external_ph',
      'seaphox_internal_ph',
      'seaphox_pressure',
      'seaphox_salinity',
      'seaphox_conductivity',
      'seaphox_oxygen',
      'seaphox_relative_humidity',
    ];
    const latestSeaphox: Record<string, number> = seaphoxMetrics.reduce(
      (acc, metric) => {
        const reading = spotterHistory.find((s) => s.metric === metric);
        return reading ? { ...acc, [metric]: reading.value } : acc;
      },
      {} as Record<string, number>,
    );

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

    const latestByMetric = windWaveData.reduce((acc, item) => {
      if (
        !acc[item.metric] ||
        new Date(item.timestamp) > new Date(acc[item.metric].timestamp)
      ) {
        return { ...acc, [item.metric]: item };
      }
      return acc;
    }, {} as Record<string, typeof windWaveData[0]>);

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

## SEAPHOX SENSOR DATA
${
  Object.keys(latestSeaphox).length > 0
    ? Object.entries(latestSeaphox)
        .map(
          ([metric, value]) =>
            `- **${metric
              .replace(/seaphox_/g, '')
              .replace(/_/g, ' ')}**: ${formatNumber(value, 2)}`,
        )
        .join('\n')
    : '- No SeapHOx sensor data available'
}

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
