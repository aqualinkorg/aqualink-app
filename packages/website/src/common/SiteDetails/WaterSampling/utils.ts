import { getSondeConfig } from 'constants/sondeConfig';
import { formatNumber } from 'helpers/numberUtils';
import { Metrics, MetricsKeys, Sources } from 'store/Sites/types';
import { GridProps } from '@material-ui/core';

type HUICardMetrics = Extract<
  Metrics,
  'salinity' | 'nitratePlusNitrite' | 'ph' | 'turbidity'
>;

export const watchColor = '#e5bb2bd0';
export const warningColor = '#ef883cd0';
export const alertColor = '#dd143ed0';

const thresholds = {
  nitratePlusNitrite: {
    good: 3.5,
    watch: 30,
    warning: 100,
  },
  turbidity: {
    good: 1,
    watch: 5,
    warning: 10,
  },
};

function getAlertColor(metric: HUICardMetrics, value?: number) {
  if (!value) return undefined;

  const compare = (th: { good: number; watch: number; warning: number }) => {
    if (value < th.good) return undefined;
    if (value < th.watch) return watchColor;
    if (value < th.warning) return warningColor;
    return alertColor;
  };

  switch (metric) {
    case 'nitratePlusNitrite':
      return compare(thresholds.nitratePlusNitrite);
    case 'turbidity':
      return compare(thresholds.turbidity);
    default:
      return undefined;
  }
}

function calculateGeometricMean(data: number[]): number {
  const product = data.reduce((acc, curr) => acc * curr);
  return product ** (1 / data.length);
}

function calculateMean(data: number[]): number {
  const sum = data.reduce((acc, curr) => acc + curr);
  return sum / data.length;
}

export function getMeanCalculationFunction(
  source: Extract<Sources, 'hui' | 'sonde'>,
): (a: number[]) => number {
  switch (source) {
    case 'hui':
      return calculateGeometricMean;
    case 'sonde':
      return calculateMean;
    default:
      throw new Error(`Unknown source: ${source}`);
  }
}

export const metricsForSource: Pick<
  { [Key in Sources]: MetricsKeys[] },
  'hui' | 'sonde'
> = {
  hui: ['turbidity', 'nitrate_plus_nitrite', 'ph', 'salinity'],
  sonde: [
    'odo_concentration',
    'cholorophyll_concentration',
    'ph',
    'salinity',
    'turbidity',
  ],
};

interface MetricField {
  label: string;
  value: string;
  unit?: string;
  color?: string;
  xs: GridProps['xs'];
}

export function metricFields(
  source: Extract<Sources, 'hui' | 'sonde'>,
  data?: Partial<Record<Metrics, number>>,
): MetricField[] {
  switch (source) {
    case 'hui':
      return [
        {
          label: 'Turbidity',
          value: `${formatNumber(data?.turbidity, 1)}`,
          unit: 'FNU',
          color: getAlertColor('turbidity', data?.turbidity),
          xs: 6,
        },
        {
          label: 'Nitrate Nitrite Nitrogen',
          value: `${formatNumber(data?.nitratePlusNitrite, 1)}`,
          unit: 'mg/L',
          color: getAlertColor('nitratePlusNitrite', data?.nitratePlusNitrite),
          xs: 6,
        },
        {
          label: 'pH',
          value: `${formatNumber(data?.ph, 1)}`,
          xs: 6,
        },
        {
          label: 'Salinity',
          value: `${formatNumber(data?.salinity, 1)}`,
          unit: 'psu',
          xs: 6,
        },
      ];

    case 'sonde':
      return [
        {
          label: 'DISSOLVED OXYGEN CONCENTRATION',
          value: formatNumber(data?.odoConcentration, 2),
          unit: getSondeConfig('odo_concentration').units,
          xs: 6,
        },
        {
          label: 'CHLOROPHYLL CONCENTRATION',
          value: formatNumber(data?.cholorophyllConcentration, 2),
          unit: getSondeConfig('cholorophyll_concentration').units,
          xs: 6,
        },
        {
          label: 'ACIDITY',
          value: formatNumber(data?.ph, 1),
          unit: getSondeConfig('ph').units,
          xs: 4,
        },
        {
          label: 'SALINITY',
          value: formatNumber(data?.salinity, 1),
          unit: getSondeConfig('salinity').units,
          xs: 5,
        },
        {
          label: 'TURBIDITY',
          value: formatNumber(data?.turbidity, 0),
          unit: getSondeConfig('turbidity').units,
          xs: 3,
        },
      ];
    default:
      throw new Error(`Unknown source: ${source}`);
  }
}
