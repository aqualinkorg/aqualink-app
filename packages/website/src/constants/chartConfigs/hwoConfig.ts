import { MetricsKeys } from '../../store/Sites/types';
import { BaseSourceConfig } from '../../utils/types';

export type HwoMetricsKeys = Extract<
  MetricsKeys,
  'enterococcus' | 'total_n' | 'turbidity' | 'salinity' | 'total_p'
>;

export const hwoConfig: Record<HwoMetricsKeys, BaseSourceConfig> = {
  enterococcus: {
    title: 'Bacteria (Enterococcus)',
    units: 'µg/L',
    description: '',
    visibility: 'public',
    order: 1,
  },
  total_n: {
    title: 'Nitrogen*',
    units: 'µg/L',
    description: '',
    visibility: 'public',
    order: 2,
  },
  turbidity: {
    title: 'Turbidity',
    units: 'NTU',
    description: '',
    visibility: 'public',
    order: 3,
  },
  salinity: {
    title: 'Salinity',
    units: 'PPT',
    description: '',
    visibility: 'public',
    order: 4,
  },
  total_p: {
    title: 'Phosphorus*',
    units: 'MTN',
    description: '',
    visibility: 'public',
    order: 5,
  },
};

export function getHwoConfig(configKey: HwoMetricsKeys) {
  return hwoConfig[configKey] || {};
}

export function getPublicHwoMetrics() {
  return Object.keys(hwoConfig).filter(
    (key) => hwoConfig[key as HwoMetricsKeys].visibility === 'public',
  ) as HwoMetricsKeys[];
}
