/**
 * SeapHOx Individual Chart Configurations
 * Each metric gets its own chart section with orange line
 */

import { Dataset } from 'common/Chart';
import { TimeSeriesData } from 'store/Sites/types';
const SEAPHOX_ORANGE = '#FF8C00';

/**
 * Creates individual chart configurations for each SeapHOx metric
 * Returns an array of chart objects, each with one metric
 */
export function getSeapHOxIndividualCharts(
  timeSeriesData?: TimeSeriesData,
): Array<{
  title: string;
  datasets: Dataset[];
  metric: string;
}> {
  if (!timeSeriesData) return [];

  let charts: Array<{
    title: string;
    datasets: Dataset[];
    metric: string;
  }> = [];

  // 1. pH CHART
  if (timeSeriesData.seaphoxExternalPh) {
    const data = timeSeriesData.seaphoxExternalPh[0]?.data || [];
    if (data.length > 0) {
      charts = [
        ...charts,
        {
          title: 'SEAPHOX pH',
          metric: 'seaphoxExternalPh',
          datasets: [
            {
              label: 'pH',
              data,
              type: 'line',
              unit: 'pH',
              curveColor: SEAPHOX_ORANGE,
              fillColor: 'rgba(255, 140, 0, 0.1)',
              surveysAttached: false,
              considerForXAxisLimits: true,
              maxHoursGap: 24,
              tooltipMaxHoursGap: 6,
              isDailyUpdated: false,
              displayData: true,
              displayCardColumn: true,
              cardColumnName: 'pH',
              tooltipLabel: 'pH',
              metric: 'seaphoxExternalPh',
              source: 'spotter',
            },
          ],
        },
      ];
    }
  }

  // 2. PRESSURE CHART
  if (timeSeriesData.seaphoxPressure) {
    const data = timeSeriesData.seaphoxPressure[0]?.data || [];
    if (data.length > 0) {
      charts = [
        ...charts,
        {
          title: 'SEAPHOX PRESSURE',
          metric: 'seaphoxPressure',
          datasets: [
            {
              label: 'Pressure',
              data,
              type: 'line',
              unit: 'dbar',
              curveColor: SEAPHOX_ORANGE,
              fillColor: 'rgba(255, 140, 0, 0.1)',
              surveysAttached: false,
              considerForXAxisLimits: true,
              maxHoursGap: 24,
              tooltipMaxHoursGap: 6,
              isDailyUpdated: false,
              displayData: true,
              displayCardColumn: true,
              cardColumnName: 'Pressure',
              tooltipLabel: 'Pressure',
              metric: 'seaphoxPressure',
              source: 'spotter',
            },
          ],
        },
      ];
    }
  }

  // 3. SALINITY CHART
  if (timeSeriesData.seaphoxSalinity) {
    const data = timeSeriesData.seaphoxSalinity[0]?.data || [];
    if (data.length > 0) {
      charts = [
        ...charts,
        {
          title: 'SEAPHOX SALINITY',
          metric: 'seaphoxSalinity',
          datasets: [
            {
              label: 'Salinity',
              data,
              type: 'line',
              unit: 'psu',
              curveColor: SEAPHOX_ORANGE,
              fillColor: 'rgba(255, 140, 0, 0.1)',
              surveysAttached: false,
              considerForXAxisLimits: true,
              maxHoursGap: 24,
              tooltipMaxHoursGap: 6,
              isDailyUpdated: false,
              displayData: true,
              displayCardColumn: true,
              cardColumnName: 'Salinity',
              tooltipLabel: 'Salinity',
              metric: 'seaphoxSalinity',
              source: 'spotter',
            },
          ],
        },
      ];
    }
  }

  // 4. CONDUCTIVITY CHART
  if (timeSeriesData.seaphoxConductivity) {
    const data = timeSeriesData.seaphoxConductivity[0]?.data || [];
    if (data.length > 0) {
      charts = [
        ...charts,
        {
          title: 'SEAPHOX CONDUCTIVITY',
          metric: 'seaphoxConductivity',
          datasets: [
            {
              label: 'Conductivity',
              data,
              type: 'line',
              unit: 'S/m',
              curveColor: SEAPHOX_ORANGE,
              fillColor: 'rgba(255, 140, 0, 0.1)',
              surveysAttached: false,
              considerForXAxisLimits: true,
              maxHoursGap: 24,
              tooltipMaxHoursGap: 6,
              isDailyUpdated: false,
              displayData: true,
              displayCardColumn: true,
              cardColumnName: 'Conductivity',
              tooltipLabel: 'Conductivity',
              metric: 'seaphoxConductivity',
              source: 'spotter',
            },
          ],
        },
      ];
    }
  }

  // 5. DISSOLVED OXYGEN CHART
  if (timeSeriesData.seaphoxOxygen) {
    const data = timeSeriesData.seaphoxOxygen[0]?.data || [];
    if (data.length > 0) {
      charts = [
        ...charts,
        {
          title: 'SEAPHOX DISSOLVED OXYGEN',
          metric: 'seaphoxOxygen',
          datasets: [
            {
              label: 'Dissolved Oxygen',
              data,
              type: 'line',
              unit: 'ml/L',
              curveColor: SEAPHOX_ORANGE,
              fillColor: 'rgba(255, 140, 0, 0.1)',
              surveysAttached: false,
              considerForXAxisLimits: true,
              maxHoursGap: 24,
              tooltipMaxHoursGap: 6,
              isDailyUpdated: false,
              displayData: true,
              displayCardColumn: true,
              cardColumnName: 'Dissolved Oxygen',
              tooltipLabel: 'Dissolved Oxygen',
              metric: 'seaphoxOxygen',
              source: 'spotter',
            },
          ],
        },
      ];
    }
  }

  return charts;
}
