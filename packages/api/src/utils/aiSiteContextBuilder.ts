/**
 * Build site context from Aqualink database for AI assistant
 * Fetches data from API endpoints and formats with exact values
 */

import axios from 'axios';

// Get backend base URL from environment variable
const { BACKEND_BASE_URL } = process.env;
if (!BACKEND_BASE_URL) {
  throw new Error('BACKEND_BASE_URL environment variable is required');
}

// Ensure the URL ends with /api
const AQUALINK_API_BASE = BACKEND_BASE_URL.endsWith('/api')
  ? BACKEND_BASE_URL
  : `${BACKEND_BASE_URL}/api`;

interface LatestDataItem {
  id: number;
  timestamp: string;
  value: number;
  source: string;
  metric: string;
  siteId: number;
}

interface DailyDataItem {
  date: string;
  satelliteTemperature: number;
  degreeHeatingDays: number;
  dailyAlertLevel: number;
  weeklyAlertLevel: number;
}

interface SiteData {
  id: number;
  name: string;
  maxMonthlyMean: number;
  region?: { name: string };
  polygon?: { coordinates: [number, number] };
  depth?: number | null;
  sensorId?: string | null;
  reefCheckSurveys?: any[];
  collectionData?: {
    tempAlert: number;
    tempWeeklyAlert: number;
    dhw: number;
    satelliteTemperature: number;
    sstAnomaly: number;
  };
}

/**
 * Extract metrics from latest_data API response
 */
function extractMetrics(latestData: LatestDataItem[]): Record<string, number> {
  const metrics: Record<string, number> = {};

  latestData.forEach((item) => {
    metrics[item.metric] = item.value;
  });

  return metrics;
}

/**
 * Calculate temperature trend from last 7 days
 */
function calculateTrend(dailyData: DailyDataItem[]): string {
  if (!dailyData || dailyData.length < 7) return 'stable';

  // Get last 7 days (already sorted newest first)
  const recent = dailyData.slice(0, 7);
  const oldest = recent[recent.length - 1].satelliteTemperature;
  const newest = recent[0].satelliteTemperature;

  const change = newest - oldest;

  if (change > 0.3) return 'increasing';
  if (change < -0.3) return 'cooling';
  return 'stable';
}

/**
 * Main function to build site context
 */
export async function buildSiteContext(siteId: number): Promise<string> {
  try {
    // Helper to safely format numbers
    const formatNumber = (value: number | undefined, decimals = 2): string => {
      return typeof value === 'number' && Number.isFinite(value)
        ? value.toFixed(decimals)
        : 'Unknown';
    };

    // Fetch data from Aqualink API endpoints
    const [siteResponse, latestDataResponse, dailyDataResponse] =
      await Promise.all([
        axios.get(`${AQUALINK_API_BASE}/sites/${siteId}`),
        axios.get(`${AQUALINK_API_BASE}/sites/${siteId}/latest_data`),
        axios.get(`${AQUALINK_API_BASE}/sites/${siteId}/daily_data`),
      ]);

    const { data: siteData }: { data: SiteData } = siteResponse;
    const { data: latestData }: { data: { latestData: LatestDataItem[] } } =
      latestDataResponse;
    const { data: dailyData }: { data: DailyDataItem[] } = dailyDataResponse;

    // Extract metrics from latest_data
    const metrics = extractMetrics(latestData.latestData);

    // Extract coordinates
    const lat = siteData.polygon?.coordinates[1]?.toFixed(4) || 'Unknown';
    const lon = siteData.polygon?.coordinates[0]?.toFixed(4) || 'Unknown';

    // Calculate values with exact precision
    const temp = (metrics as Record<string, number>).satellite_temperature;
    const anomaly = (metrics as Record<string, number>).sst_anomaly;
    const { dhw } = metrics as { dhw?: number };
    const mmm = siteData.maxMonthlyMean;
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
    const { degreeHeatingDays = 0 } = dailyData?.[0] ?? {};

    // Calculate trend from daily data
    const trend = calculateTrend(dailyData);

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
    const spotterStatus = hasSpotter
      ? 'Smart Buoy is deployed at this site'
      : 'No Smart Buoy deployed - using satellite data only';

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
- **Sensor Status**: ${spotterStatus}
- **Data Source**: ${
      hasSpotter ? 'Spotter Smart Buoy' : 'NOAA Satellite (Coral Reef Watch)'
    }

## CURRENT REEF METRICS (as of ${currentDate})

### Temperature Data
- **Sea Surface Temperature (SST)**: ${formatNumber(temp)}°C
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
- **Degree Heating Days**: ${degreeHeatingDays.toFixed(0)}
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
      `- ${day.date.split('T')[0]}: ${formatNumber(
        day.satelliteTemperature,
      )}°C, DHW: ${formatNumber(day.degreeHeatingDays / 7)}, Weekly Alert: ${
        day.weeklyAlertLevel
      }`,
  )
  .join('\n')}

**Instructions for using historical data:**
- When user asks "What was the temperature on [date]?", find that date in the list above
- Use EXACT values from the historical data - don't estimate
- If date not found, say "Data not available for that specific date"

## REEF CHECK SURVEY DATA
${
  siteData.reefCheckSurveys && siteData.reefCheckSurveys.length > 0
    ? `- **Surveys Available**: ${
        siteData.reefCheckSurveys.length
      } Reef Check survey(s) on record
- **Most Recent Survey**: ${siteData.reefCheckSurveys[0]?.date || 'Unknown'}
- **Survey Details Available**: Yes (depth, impacts, bleaching data if recorded)`
    : '- **Surveys Available**: None uploaded yet - encourage user to conduct and upload surveys'
}

## DATA ACCURACY REQUIREMENTS - CRITICAL
✅ **USE THESE EXACT VALUES** in your response - they come directly from the API
✅ **DO NOT ROUND** beyond the precision shown (2 decimals for temp, DHW)
✅ **DO NOT ESTIMATE OR HALLUCINATE** - if a value is missing, say "data unavailable"
✅ **ALWAYS CITE**: "According to ${
      hasSpotter ? 'Smart Buoy' : 'NOAA satellite'
    } data as of ${currentDate}..."
✅ **TEMPERATURE FORMAT**: Always show as ±X.XX°C with + or - sign (e.g., +1.10°C or -0.50°C)
✅ **NO GUESSING**: If you don't see a value in the CURRENT REEF METRICS section above, you MUST NOT make one up

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
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        throw new Error(`Site with ID ${siteId} not found`);
      }
      throw new Error(`Failed to fetch site data: ${error.message}`);
    }
    throw error;
  }
}
