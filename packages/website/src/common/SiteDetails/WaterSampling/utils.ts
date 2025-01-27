import { formatNumber } from 'helpers/numberUtils';
import { Metrics, MetricsKeys, Sources } from 'store/Sites/types';
import { GridProps } from '@mui/material';
import siteServices from 'services/siteServices';
import { timeSeriesRequest } from 'store/Sites/helpers';
import { getSondeConfig } from 'constants/chartConfigs/sondeConfig';

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
  source: Extract<Sources, 'hui' | 'sonde'>,
): (a: number[]) => number | undefined {
  switch (source) {
    case 'hui':
      return calculateGeometricMean;
    case 'sonde':
      return calculateMean;
    default:
      throw new Error(`Unknown source: ${source}`);
  }
}

const metricsForSource: Pick<
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
    default:
      throw new Error(`Unknown source: ${source}`);
  }
}

export async function getCardData(
  siteId: string,
  source: Extract<Sources, 'hui' | 'sonde'>,
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
      case 'sonde': {
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
