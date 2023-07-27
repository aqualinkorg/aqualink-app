import { MetricsKeys } from '../../store/Sites/types';
import { BaseSourceConfig } from '../../utils/types';

export type SondeMetricsKeys = Extract<
  MetricsKeys,
  'salinity' | 'turbidity' | 'nitrate_plus_nitrite' | 'ph'
>;

export const huiConfig: Record<SondeMetricsKeys, BaseSourceConfig> = {
  salinity: {
    title: 'Salinity',
    units: 'psu',
    description: '',
    visibility: 'public',
    order: 1,
  },
  turbidity: {
    title: 'Turbidity',
    units: 'FNU',
    description: '',
    visibility: 'public',
    order: 2,
  },
  nitrate_plus_nitrite: {
    title: 'Nitrate Nitrate Nitrogen',
    units: 'mg/L',
    description: '',
    visibility: 'public',
    order: 2,
  },
  ph: {
    title: 'Acidity',
    units: '',
    description: '',
    visibility: 'public',
    order: 5,
  },
};

export function getHuiConfig(configKey: SondeMetricsKeys) {
  return huiConfig[configKey] || {};
}

export function getPublicHuiMetrics() {
  return Object.keys(huiConfig).filter(
    (key) => huiConfig[key as SondeMetricsKeys].visibility === 'public',
  ) as SondeMetricsKeys[];
}
