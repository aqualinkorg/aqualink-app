import { MetricsKeys } from '../../store/Sites/types';
import { BaseSourceConfig } from '../../utils/types';

export type HwoMetricsKeys = Extract<
  MetricsKeys,
  | 'enterococcus'
  | 'nitrogen_total'
  | 'turbidity'
  | 'salinity'
  | 'phosphorus_total'
>;

export const hwoConfig: Record<HwoMetricsKeys, BaseSourceConfig> = {
  enterococcus: {
    title: 'Bacteria (Enterococcus)',
    units: 'CFU/100 mL',
    description: '',
    visibility: 'public',
    order: 1,
  },
  nitrogen_total: {
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
  phosphorus_total: {
    title: 'Phosphorus*',
    units: 'µg/L',
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
