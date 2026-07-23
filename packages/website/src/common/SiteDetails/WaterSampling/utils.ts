import { formatNumber } from 'helpers/numberUtils';
import { Metrics, MetricsKeys, Sources } from 'store/Sites/types';
import { GridProps } from '@mui/material';
import siteServices from 'services/siteServices';
import { timeSeriesRequest } from 'store/Sites/helpers';
import { getSondeConfig } from 'constants/chartConfigs/sondeConfig';

type HwoMetricsKeys = Extract<
  MetricsKeys,
  | 'enterococcus'
  | 'nitrogen_total'
  | 'turbidity'
  | 'salinity'
  | 'phosphorus_total'
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
    color: '#00C359',
    label: 'Acceptable',
    iconType: 'check',
    iconColor: '#00C359',
  },
  moderatelyAcceptable: {
    color: '#71EF56',
    label: 'Moderately acceptable',
    iconType: 'check',
    iconColor: '#71EF56',
  },
  fair: {
    color: '#FFDC35',
    label: 'Fair',
    iconType: 'warning',
    iconColor: '#FFDC35',
  },
  moderatelyImpaired: {
    color: '#FFA800',
    label: 'Moderately impaired',
    iconType: 'warning',
    iconColor: '#FFA800',
  },
  impaired: {
    color: '#FF001E',
    label: 'Impaired',
    iconType: 'warning',
    iconColor: '#FF001E',
  },
};

// Thresholds shared across all HWO sites
const ENTEROCOCCUS_THRESHOLDS: HwoThresholdRange = {
  acceptable: [0, 78],
  moderatelyAcceptable: [78, 104],
  fair: [104, 130],
  moderatelyImpaired: [130, 156],
  impaired: [156, Infinity],
};

const TURBIDITY_THRESHOLDS: HwoThresholdRange = {
  acceptable: [0, 0.5],
  moderatelyAcceptable: [0.5, 5],
  fair: [5, 10],
  moderatelyImpaired: [10, 15],
  impaired: [15, Infinity],
};

// Salinity: no thresholds provided by HWO

// Group 1: Richardson Beach Park (9095), Carlsmith Beach Park (9084), Puhi Bay Beach (9093)
// HAR 11-54 threshold: Nitrogen 150 µg/L, Phosphorus 20 µg/L
const GROUP_1_THRESHOLDS: HwoThresholds = {
  enterococcus: ENTEROCOCCUS_THRESHOLDS,
  nitrogen_total: {
    acceptable: [0, 90],
    moderatelyAcceptable: [90, 120],
    fair: [120, 150],
    moderatelyImpaired: [150, 180],
    impaired: [180, Infinity],
  },
  turbidity: TURBIDITY_THRESHOLDS,
  phosphorus_total: {
    acceptable: [0, 12],
    moderatelyAcceptable: [12, 16],
    fair: [16, 20],
    moderatelyImpaired: [20, 24],
    impaired: [24, Infinity],
  },
};

// Group 2: Moku Ola Beach (9083), Reeds Bay Beach (9094)
// HAR 11-54 threshold: Nitrogen 200 µg/L, Phosphorus 25 µg/L
const GROUP_2_THRESHOLDS: HwoThresholds = {
  enterococcus: ENTEROCOCCUS_THRESHOLDS,
  nitrogen_total: {
    acceptable: [0, 120],
    moderatelyAcceptable: [120, 160],
    fair: [160, 200],
    moderatelyImpaired: [200, 240],
    impaired: [240, Infinity],
  },
  turbidity: TURBIDITY_THRESHOLDS,
  phosphorus_total: {
    acceptable: [0, 15],
    moderatelyAcceptable: [15, 20],
    fair: [20, 25],
    moderatelyImpaired: [25, 30],
    impaired: [30, Infinity],
  },
};

// Group 3: Hapuna N/S (9085, 9086), Waialea N/S (9097, 9098), Secrets (9100),
//          Paniau (9092), Kahaluu Bay A-E (9088, 9089, 9090, 9091, 9099)
// HAR 11-54 threshold: Nitrogen 100 µg/L, Phosphorus 12.5 µg/L
const GROUP_3_THRESHOLDS: HwoThresholds = {
  enterococcus: ENTEROCOCCUS_THRESHOLDS,
  nitrogen_total: {
    acceptable: [0, 60],
    moderatelyAcceptable: [60, 80],
    fair: [80, 100],
    moderatelyImpaired: [100, 120],
    impaired: [120, Infinity],
  },
  turbidity: TURBIDITY_THRESHOLDS,
  phosphorus_total: {
    acceptable: [0, 7.5],
    moderatelyAcceptable: [7.5, 10],
    fair: [10, 12.5],
    moderatelyImpaired: [12.5, 15],
    impaired: [15, Infinity],
  },
};

export const hwoThresholds: Record<number, HwoThresholds> = {
  // Production site IDs
  9083: GROUP_2_THRESHOLDS,
  9084: GROUP_1_THRESHOLDS,
  9085: GROUP_3_THRESHOLDS,
  9086: GROUP_3_THRESHOLDS,
  9088: GROUP_3_THRESHOLDS,
  9089: GROUP_3_THRESHOLDS,
  9090: GROUP_3_THRESHOLDS,
  9091: GROUP_3_THRESHOLDS,
  9092: GROUP_3_THRESHOLDS,
  9093: GROUP_1_THRESHOLDS,
  9094: GROUP_2_THRESHOLDS,
  9095: GROUP_1_THRESHOLDS,
  9097: GROUP_3_THRESHOLDS,
  9098: GROUP_3_THRESHOLDS,
  9099: GROUP_3_THRESHOLDS,
  9100: GROUP_3_THRESHOLDS,
  // Staging site IDs
  7556: GROUP_2_THRESHOLDS,
  7557: GROUP_1_THRESHOLDS,
  7558: GROUP_3_THRESHOLDS,
  7559: GROUP_3_THRESHOLDS,
  7560: GROUP_3_THRESHOLDS,
  7561: GROUP_3_THRESHOLDS,
  7562: GROUP_3_THRESHOLDS,
  7563: GROUP_3_THRESHOLDS,
  7564: GROUP_3_THRESHOLDS,
  7565: GROUP_1_THRESHOLDS,
  7566: GROUP_2_THRESHOLDS,
  7567: GROUP_1_THRESHOLDS,
  7568: GROUP_3_THRESHOLDS,
  7569: GROUP_3_THRESHOLDS,
  7570: GROUP_3_THRESHOLDS,
  7571: GROUP_3_THRESHOLDS,
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

const DOH_THRESHOLD_METRICS: HwoMetricsKeys[] = [
  'enterococcus',
  'nitrogen_total',
  'phosphorus_total',
];

export function getHwoDohThreshold(
  siteId: number,
  metric: HwoMetricsKeys,
): number | undefined {
  if (!DOH_THRESHOLD_METRICS.includes(metric)) return undefined;
  return hwoThresholds[siteId]?.[metric]?.moderatelyImpaired[0];
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
  hwo: [
    'enterococcus',
    'nitrogen_total',
    'turbidity',
    'salinity',
    'phosphorus_total',
  ],
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
          label: 'BACTERIA (ENTEROCOCCUS)',
          value: `${formatNumber(data?.enterococcus, 1)}`,
          unit: 'CFU/100 mL',
          ...iconFor('enterococcus', data?.enterococcus),
          xs: 6,
        },
        {
          label: 'PHOSPHORUS*',
          value: `${formatNumber(data?.phosphorusTotal, 1)}`,
          unit: 'µg/L',
          ...iconFor('phosphorus_total', data?.phosphorusTotal),
          xs: 6,
        },
        {
          label: 'TURBIDITY',
          value: `${formatNumber(data?.turbidity, 1)}`,
          unit: 'NTU',
          ...iconFor('turbidity', data?.turbidity),
          xs: 4,
        },
        {
          label: 'SALINITY',
          value: `${formatNumber(data?.salinity, 1)}`,
          unit: 'PPT',
          ...iconFor('salinity', data?.salinity),
          xs: 4,
        },
        {
          label: 'NITROGEN*',
          value: `${formatNumber(data?.nitrogenTotal, 1)}`,
          unit: 'µg/L',
          ...iconFor('nitrogen_total', data?.nitrogenTotal),
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
