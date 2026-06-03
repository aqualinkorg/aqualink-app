import { formatNumber } from 'helpers/numberUtils';
import { Metrics, MetricsKeys, Sources } from 'store/Sites/types';
import { GridProps } from '@mui/material';
import siteServices from 'services/siteServices';
import { timeSeriesRequest } from 'store/Sites/helpers';
import { getSondeConfig } from 'constants/chartConfigs/sondeConfig';

type HwoMetricsKeys = Extract<
  MetricsKeys,
  'enterococcus' | 'total_n' | 'turbidity' | 'salinity' | 'total_p'
>;

type HUICardMetrics = Extract<
  Metrics,
  'salinity' | 'nitratePlusNitrite' | 'ph' | 'turbidity'
>;

export const watchColor = '#e5bb2bd0';
export const warningColor = '#ef883cd0';
export const alertColor = '#dd143ed0';

// HUI thresholds
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

// HWO threshold types and data
export type HwoThresholdLevel =
  | 'acceptable'
  | 'moderatelyAcceptable'
  | 'fair'
  | 'moderatelyImpaired'
  | 'impaired';

export interface HwoThresholdRange {
  acceptable: [number, number];
  moderatelyAcceptable: [number, number];
  fair: [number, number];
  moderatelyImpaired: [number, number];
  impaired: [number, number];
}

export type HwoThresholds = Partial<Record<HwoMetricsKeys, HwoThresholdRange>>;

export const hwoLevels: HwoThresholdLevel[] = [
  'acceptable',
  'moderatelyAcceptable',
  'fair',
  'moderatelyImpaired',
  'impaired',
];

export const hwoLevelConfig: Record<
  HwoThresholdLevel,
  {
    color: string;
    label: string;
    iconType: 'check' | 'warning';
    iconColor: string;
  }
> = {
  acceptable: {
    color: '#4caf50',
    label: 'Acceptable',
    iconType: 'check',
    iconColor: '#4caf50',
  },
  moderatelyAcceptable: {
    color: '#8bc34a',
    label: 'Moderately acceptable',
    iconType: 'check',
    iconColor: '#8bc34a',
  },
  fair: {
    color: '#ffca28',
    label: 'Fair',
    iconType: 'warning',
    iconColor: '#f9a825',
  },
  moderatelyImpaired: {
    color: '#ff9800',
    label: 'Moderately impaired',
    iconType: 'warning',
    iconColor: '#ff9800',
  },
  impaired: {
    color: '#f44336',
    label: 'Impaired',
    iconType: 'warning',
    iconColor: '#f44336',
  },
};

// TODO: Confirm site IDs and replace placeholder thresholds for all 16 HWO sites
const PLACEHOLDER_THRESHOLDS: HwoThresholds = {
  enterococcus: {
    acceptable: [0, 35],
    moderatelyAcceptable: [35, 104],
    fair: [104, 276],
    moderatelyImpaired: [276, 500],
    impaired: [500, Infinity],
  },
  total_n: {
    acceptable: [0, 200],
    moderatelyAcceptable: [200, 400],
    fair: [400, 600],
    moderatelyImpaired: [600, 800],
    impaired: [800, Infinity],
  },
  turbidity: {
    acceptable: [0, 1],
    moderatelyAcceptable: [1, 3],
    fair: [3, 5],
    moderatelyImpaired: [5, 10],
    impaired: [10, Infinity],
  },
  salinity: {
    acceptable: [0, 25],
    moderatelyAcceptable: [25, 28],
    fair: [28, 30],
    moderatelyImpaired: [30, 35],
    impaired: [35, Infinity],
  },
  total_p: {
    acceptable: [0, 25],
    moderatelyAcceptable: [25, 50],
    fair: [50, 75],
    moderatelyImpaired: [75, 100],
    impaired: [100, Infinity],
  },
};

export const hwoThresholds: Record<number, HwoThresholds> = {
  9083: PLACEHOLDER_THRESHOLDS,
  9084: PLACEHOLDER_THRESHOLDS,
  9085: PLACEHOLDER_THRESHOLDS,
  9086: PLACEHOLDER_THRESHOLDS,
  9088: PLACEHOLDER_THRESHOLDS,
  9089: PLACEHOLDER_THRESHOLDS,
  9090: PLACEHOLDER_THRESHOLDS,
  9091: PLACEHOLDER_THRESHOLDS,
  9092: PLACEHOLDER_THRESHOLDS,
  9093: PLACEHOLDER_THRESHOLDS,
  9094: PLACEHOLDER_THRESHOLDS,
  9095: PLACEHOLDER_THRESHOLDS,
  9097: PLACEHOLDER_THRESHOLDS,
  9098: PLACEHOLDER_THRESHOLDS,
  9099: PLACEHOLDER_THRESHOLDS,
  9100: PLACEHOLDER_THRESHOLDS,
};

function getHwoLevel(
  ranges: HwoThresholdRange,
  value: number,
): HwoThresholdLevel | undefined {
  return (
    Object.entries(ranges) as [HwoThresholdLevel, [number, number]][]
  ).find(([, [min, max]]) => value >= min && value < max)?.[0];
}

export function getHwoIconConfig(
  siteId: number,
  metric: HwoMetricsKeys,
  value: number,
): { iconType: 'check' | 'warning'; iconColor: string } | undefined {
  const siteThresholds = hwoThresholds[siteId];
  if (!siteThresholds) return undefined;
  const metricThresholds = siteThresholds[metric];
  if (!metricThresholds) return undefined;
  const level = getHwoLevel(metricThresholds, value);
  if (!level) return undefined;
  const { iconType, iconColor } = hwoLevelConfig[level];
  return { iconType, iconColor };
}

function calculateGeometricMean(data: number[]): number | undefined {
  if (data.length === 0) return undefined;
  const lnSum = data.reduce((acc, curr) => acc + Math.log(curr), 0);
  return Math.exp(lnSum / data.length);
}

function calculateMean(data: number[]): number | undefined {
  if (data.length === 0) return undefined;
  const sum = data.reduce((acc, curr) => acc + curr);
  return sum / data.length;
}

export function getMeanCalculationFunction(
  source: Extract<Sources, 'hui' | 'sonde' | 'hwo'>,
): (a: number[]) => number | undefined {
  switch (source) {
    case 'hui':
    case 'hwo':
      return calculateGeometricMean;
    case 'sonde':
      return calculateMean;
    default:
      throw new Error(`Unknown source: ${source}`);
  }
}

const metricsForSource: Pick<
  { [Key in Sources]: MetricsKeys[] },
  'hui' | 'sonde' | 'hwo'
> = {
  hui: ['turbidity', 'nitrate_plus_nitrite', 'ph', 'salinity'],
  sonde: [
    'odo_concentration',
    'cholorophyll_concentration',
    'ph',
    'salinity',
    'turbidity',
  ],
  hwo: ['enterococcus', 'total_n', 'turbidity', 'salinity', 'total_p'],
};

interface MetricField {
  label: string;
  value: string;
  unit?: string;
  color?: string;
  iconType?: 'check' | 'warning';
  iconColor?: string;
  xs: GridProps['xs'];
}

export function metricFields(
  source: Extract<Sources, 'hui' | 'sonde' | 'hwo'>,
  data?: Partial<Record<Metrics, number>>,
  siteId?: number,
): MetricField[] {
  switch (source) {
    case 'hui':
      return [
        {
          label: 'Turbidity',
          value: `${formatNumber(data?.turbidity, 1)}`,
          unit: 'NTU',
          color: getAlertColor('turbidity', data?.turbidity),
          xs: 6,
        },
        {
          label: 'Nitrate Nitrite Nitrogen',
          value: `${formatNumber(data?.nitratePlusNitrite, 1)}`,
          unit: 'µg/L',
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
          unit: source === 'hui' ? 'ppt' : 'psu',
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

    case 'hwo': {
      const iconFor = (metric: HwoMetricsKeys, value?: number) =>
        siteId !== undefined && value !== undefined
          ? (getHwoIconConfig(siteId, metric, value) ?? {})
          : {};
      return [
        {
          label: 'Bacteria (Enterococcus)',
          value: `${formatNumber(data?.enterococcus, 1)}`,
          unit: 'µg/L',
          ...iconFor('enterococcus', data?.enterococcus),
          xs: 6,
        },
        {
          label: 'Nitrogen*',
          value: `${formatNumber(data?.totalN, 1)}`,
          unit: 'µg/L',
          ...iconFor('total_n', data?.totalN),
          xs: 6,
        },
        {
          label: 'Turbidity',
          value: `${formatNumber(data?.turbidity, 1)}`,
          unit: 'NTU',
          ...iconFor('turbidity', data?.turbidity),
          xs: 4,
        },
        {
          label: 'Salinity',
          value: `${formatNumber(data?.salinity, 1)}`,
          unit: 'PPT',
          ...iconFor('salinity', data?.salinity),
          xs: 4,
        },
        {
          label: 'Phosphorus*',
          value: `${formatNumber(data?.totalP, 1)}`,
          unit: 'MTN',
          ...iconFor('total_p', data?.totalP),
          xs: 4,
        },
      ];
    }

    default:
      throw new Error(`Unknown source: ${source}`);
  }
}

export async function getCardData(
  siteId: string,
  source: Extract<Sources, 'hui' | 'sonde' | 'hwo'>,
) {
  try {
    const { data: uploadHistory } = await siteServices.getSiteUploadHistory(
      parseInt(siteId, 10),
    );

    const uploads =
      uploadHistory.filter(
        (x) =>
          x.dataUpload.sensorTypes.includes(source) ||
          // hui is specific type of sonde, look for hui as well when looking for sonde
          (source === 'sonde' && x.dataUpload.sensorTypes.includes('hui')),
      ) || [];
    if (uploads.length < 1) {
      return {};
    }

    switch (source) {
      case 'hui': {
        const now = new Date();
        const lastYear = now.setFullYear(now.getFullYear() - 1);
        const inLastYear = uploads.filter(
          ({ dataUpload: { maxDate } }) =>
            new Date(maxDate) > new Date(lastYear),
        );

        const minDate = inLastYear.reduce((min, curr) => {
          const currMin = curr.minDate || curr.dataUpload.minDate;
          return currMin < min ? currMin : min;
        }, new Date().toISOString());

        const maxDate =
          inLastYear.length > 0
            ? inLastYear.reduce((max, curr) => {
                const currMax = curr.maxDate || curr.dataUpload.maxDate;
                return currMax > max ? currMax : max;
              }, new Date(0).toISOString())
            : new Date().toISOString();

        const [data] = await timeSeriesRequest({
          siteId,
          start: minDate,
          end: maxDate,
          metrics: metricsForSource[source],
          hourly: true,
        });

        const pointId = inLastYear[0]?.surveyPoint;
        const samePoint =
          pointId !== null
            ? inLastYear.reduce(
                (acc, curr) => acc && curr.surveyPoint?.id === pointId.id,
                true,
              )
            : false;

        return {
          data,
          minDate,
          maxDate,
          point: samePoint ? pointId : undefined,
        };
      }
      case 'hwo': {
        const now = new Date();
        const lastYear = now.setFullYear(now.getFullYear() - 1);
        const inLastYear = uploads.filter(
          ({ dataUpload: { maxDate } }) =>
            new Date(maxDate) > new Date(lastYear),
        );

        const minDate = inLastYear.reduce((min, curr) => {
          const currMin = curr.minDate || curr.dataUpload.minDate;
          return currMin < min ? currMin : min;
        }, new Date().toISOString());

        const maxDate =
          inLastYear.length > 0
            ? inLastYear.reduce((max, curr) => {
                const currMax = curr.maxDate || curr.dataUpload.maxDate;
                return currMax > max ? currMax : max;
              }, new Date(0).toISOString())
            : new Date().toISOString();

        const [data] = await timeSeriesRequest({
          siteId,
          start: minDate,
          end: maxDate,
          metrics: metricsForSource[source],
          hourly: true,
        });

        const pointId = inLastYear[0]?.surveyPoint;
        const samePoint =
          pointId !== null
            ? inLastYear.reduce(
                (acc, curr) => acc && curr.surveyPoint?.id === pointId.id,
                true,
              )
            : false;

        return {
          data,
          minDate,
          maxDate,
          point: samePoint ? pointId : undefined,
        };
      }
      case 'sonde': {
        // eslint-disable-next-line fp/no-mutating-methods
        uploads.sort((a, b) => {
          if (a.maxDate && b.maxDate) {
            const timeA = new Date(a.maxDate).getTime();
            const timeB = new Date(b.maxDate).getTime();
            return timeB - timeA;
          }
          return 0;
        });
        const { minDate, maxDate } = uploads[0].dataUpload;
        const { surveyPoint } = uploads[0];
        const [data] = await timeSeriesRequest({
          siteId,
          start: minDate,
          end: maxDate,
          metrics: metricsForSource[source],
          hourly: true,
        });
        return {
          data,
          minDate,
          maxDate,
          point: surveyPoint,
        };
      }
      default:
        throw new Error(`Unknown source: ${source}`);
    }
  } catch (err) {
    console.error(err);
    return {};
  }
}
