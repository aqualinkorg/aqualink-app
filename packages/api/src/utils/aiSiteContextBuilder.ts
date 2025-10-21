import { DataSource } from 'typeorm';
import { Site } from '../sites/sites.entity';
import { DailyData } from '../sites/daily-data.entity';
import { ReefCheckSurvey } from '../reef-check-surveys/reef-check-surveys.entity';

/* eslint-disable fp/no-mutation */

interface SiteContextData {
  site: Site;
  latestDailyData?: DailyData | null;
  reefCheckSurveys?: ReefCheckSurvey[];
}

/**
 * Extract latitude and longitude from GeoJSON Point
 */
function extractCoordinates(polygon: any): {
  latitude: number;
  longitude: number;
} {
  if (polygon?.type === 'Point' && Array.isArray(polygon.coordinates)) {
    return {
      longitude: polygon.coordinates[0],
      latitude: polygon.coordinates[1],
    };
  }
  return { latitude: 0, longitude: 0 };
}

/**
 * Fetch all necessary site data from the database
 */
export async function fetchSiteData(
  siteId: number,
  dataSource: DataSource,
): Promise<SiteContextData> {
  // Fetch site details
  const site = await dataSource.getRepository(Site).findOne({
    where: { id: siteId },
    relations: ['region'],
  });

  if (!site) {
    throw new Error(`Site with ID ${siteId} not found`);
  }

  // Fetch latest daily data (DHW, SST, etc.)
  const latestDailyData = await dataSource
    .getRepository(DailyData)
    .createQueryBuilder('dailyData')
    .leftJoinAndSelect('dailyData.site', 'site')
    .where('site.id = :siteId', { siteId })
    .orderBy('dailyData.date', 'DESC')
    .take(1)
    .getOne();

  // Fetch reef check surveys if available
  const reefCheckSurveys = await dataSource
    .getRepository(ReefCheckSurvey)
    .createQueryBuilder('survey')
    .leftJoinAndSelect('survey.site', 'site')
    .where('site.id = :siteId', { siteId })
    .orderBy('survey.date', 'DESC')
    .take(5)
    .getMany();

  return {
    site,
    latestDailyData: latestDailyData || null,
    reefCheckSurveys,
  };
}

/**
 * Format site data into a human-readable context string for Grok
 */
export function buildSiteContextString(data: SiteContextData): string {
  const { site, latestDailyData, reefCheckSurveys } = data;

  let context = `## CURRENT SITE INFORMATION:\n\n`;

  // Basic site info
  context += `**Site Name:** ${site.name || 'Unknown'}\n`;

  // Extract coordinates from polygon
  const coords = extractCoordinates(site.polygon);
  context += `**Location:** ${coords.latitude.toFixed(
    4,
  )}°N, ${coords.longitude.toFixed(4)}°E\n`;

  // Infer ecosystem type from location
  const ecosystemType = inferEcosystemType(coords.latitude);
  context += `**Ecosystem Type:** ${ecosystemType}\n\n`;

  // Current conditions from latest daily data
  if (latestDailyData) {
    context += `## CURRENT OCEAN CONDITIONS:\n\n`;
    context += `**Date:** ${latestDailyData.date}\n`;

    if (latestDailyData.satelliteTemperature !== null) {
      context += `**Sea Surface Temperature (SST):** ${latestDailyData.satelliteTemperature.toFixed(
        1,
      )}°C\n`;
    }

    if (latestDailyData.degreeHeatingDays !== null) {
      // Convert Degree Heating Days to Degree Heating Weeks
      const dhw = latestDailyData.degreeHeatingDays / 7;
      context += `**Degree Heating Weeks (DHW):** ${dhw.toFixed(1)}\n`;

      // Interpret alert level
      const alertLevel = getAlertLevel(dhw);
      context += `**Bleaching Alert Level:** ${alertLevel}\n`;

      // IMPORTANT: Add clear interpretation for the AI
      context += `\nIMPORTANT INTERPRETATION:\n`;
      if (dhw >= 12) {
        context += `- Current status: CRITICAL ALERT (Level 2)\n`;
        context += `- Bleaching: Severe bleaching and significant mortality are occurring or imminent\n`;
        context += `- Action needed: Immediate emergency response required\n`;
      } else if (dhw >= 8) {
        context += `- Current status: ALERT (Level 1 - WARNING)\n`;
        context += `- Bleaching: Significant bleaching is likely occurring\n`;
        context += `- Action needed: Increase monitoring, implement mitigation measures\n`;
      } else if (dhw >= 4) {
        context += `- Current status: WATCH (Yellow)\n`;
        context += `- Bleaching: Coral bleaching is possible and may begin soon\n`;
        context += `- Action needed: Begin preparation, increase monitoring frequency\n`;
      } else {
        context += `- Current status: NO ALERT (Normal conditions)\n`;
        context += `- Bleaching: No bleaching expected at current heat stress levels\n`;
        context += `- Action needed: Continue routine monitoring\n`;
      }
      context += `\n`;
    }

    // Alert levels
    if (latestDailyData.weeklyAlertLevel !== null) {
      context += `**Weekly Alert Level:** ${latestDailyData.weeklyAlertLevel}\n`;
    }

    context += `\n`;
  } else {
    context += `## CURRENT OCEAN CONDITIONS:\n\n`;
    context += `No recent satellite data available for this site.\n\n`;
  }

  // Smart Buoy status
  const hasSpotter = !!site.sensorId;
  context += `**Smart Buoy Deployed:** ${
    hasSpotter
      ? `Yes (Sensor ID: ${site.sensorId})`
      : 'No - Using satellite data only'
  }\n\n`;

  // Reef Check data
  if (reefCheckSurveys && reefCheckSurveys.length > 0) {
    context += `## REEF CHECK SURVEY DATA AVAILABLE:\n\n`;
    context += `${reefCheckSurveys.length} survey(s) found for this site.\n`;
    context += `Most recent survey: ${reefCheckSurveys[0].date}\n`;
    context += `These surveys contain data on reef composition including hard coral, soft coral, rock, rubble, sand, and other substrates.\n\n`;
  } else {
    context += `## REEF CHECK SURVEY DATA:\n\n`;
    context += `No Reef Check survey data available for this site. If asked about reef composition or biodiversity, explain that survey data is not available but you can provide general information based on the location.\n\n`;
  }

  // Data freshness
  if (latestDailyData) {
    const daysSinceUpdate = Math.floor(
      (Date.now() - new Date(latestDailyData.date).getTime()) /
        (1000 * 60 * 60 * 24),
    );
    context += `**Data Freshness:** Last satellite data received ${daysSinceUpdate} day${
      daysSinceUpdate !== 1 ? 's' : ''
    } ago. NOAA satellite data updates daily.\n`;
  }

  return context;
}

/**
 * Infer ecosystem type from latitude
 */
function inferEcosystemType(latitude: number): string {
  // Tropical zone: roughly between 23.5°N and 23.5°S
  const isTropical = Math.abs(latitude) <= 23.5;

  if (isTropical) {
    return 'Tropical coral reef';
  }

  // Temperate/subtropical
  if (Math.abs(latitude) > 23.5 && Math.abs(latitude) < 40) {
    return 'Subtropical/temperate reef (may include coral, kelp, or rocky reef)';
  }

  // Cold water
  return 'Temperate/cold-water ecosystem (kelp forest, rocky reef, or deep-sea coral)';
}

/**
 * Get alert level description from DHW value
 */
function getAlertLevel(dhw: number): string {
  if (dhw >= 16) return 'Level 2 Alert (Dark Red) - Extreme';
  if (dhw >= 12) return 'Level 1 Alert (Red) - Severe';
  if (dhw >= 8) return 'Warning (Orange) - Significant';
  if (dhw >= 4) return 'Watch (Yellow) - Possible bleaching';
  return 'No Alert (Normal conditions)';
}

/**
 * Main function to build complete context for Grok
 * NOTE: This should be called from the controller with dependency injection
 */
export async function buildSiteContext(
  siteId: number,
  dataSource: DataSource,
): Promise<string> {
  const data = await fetchSiteData(siteId, dataSource);
  return buildSiteContextString(data);
}
