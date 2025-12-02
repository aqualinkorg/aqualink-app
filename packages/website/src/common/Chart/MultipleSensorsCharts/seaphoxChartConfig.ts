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

  const phChart = timeSeriesData.seaphoxExternalPh?.[0]?.data?.length
    ? [
        {
          title: 'SEAPHOX pH',
          metric: 'seaphoxExternalPh',
          datasets: [
            {
              label: 'pH',
              data: timeSeriesData.seaphoxExternalPh[0].data,
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
              decimalPlaces: 4,
            },
          ],
        },
      ]
    : [];

  const pressureChart = timeSeriesData.seaphoxPressure?.[0]?.data?.length
    ? [
        {
          title: 'SEAPHOX PRESSURE',
          metric: 'seaphoxPressure',
          datasets: [
            {
              label: 'Pressure',
              data: timeSeriesData.seaphoxPressure[0].data,
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
              decimalPlaces: 3,
            },
          ],
        },
      ]
    : [];

  const salinityChart = timeSeriesData.seaphoxSalinity?.[0]?.data?.length
    ? [
        {
          title: 'SEAPHOX SALINITY',
          metric: 'seaphoxSalinity',
          datasets: [
            {
              label: 'Salinity',
              data: timeSeriesData.seaphoxSalinity[0].data,
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
              decimalPlaces: 4,
            },
          ],
        },
      ]
    : [];

  const conductivityChart = timeSeriesData.seaphoxConductivity?.[0]?.data
    ?.length
    ? [
        {
          title: 'SEAPHOX CONDUCTIVITY',
          metric: 'seaphoxConductivity',
          datasets: [
            {
              label: 'Conductivity',
              data: timeSeriesData.seaphoxConductivity[0].data,
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
              decimalPlaces: 5,
            },
          ],
        },
      ]
    : [];

  const oxygenChart = timeSeriesData.seaphoxOxygen?.[0]?.data?.length
    ? [
        {
          title: 'SEAPHOX DISSOLVED OXYGEN',
          metric: 'seaphoxOxygen',
          datasets: [
            {
              label: 'Dissolved Oxygen',
              data: timeSeriesData.seaphoxOxygen[0].data,
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
              decimalPlaces: 3,
            },
          ],
        },
      ]
    : [];

  return [
    ...phChart,
    ...pressureChart,
    ...salinityChart,
    ...conductivityChart,
    ...oxygenChart,
  ] as Array<{
    title: string;
    datasets: Dataset[];
    metric: string;
  }>;
}
