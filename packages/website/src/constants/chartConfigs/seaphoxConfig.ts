import { MetricsKeys } from 'store/Sites/types';
import { BaseSourceConfig } from '../../utils/types';

export type SeaphoxMetricsKeys = Extract<
  MetricsKeys,
  | 'seaphox_external_ph'
  | 'seaphox_pressure'
  | 'seaphox_salinity'
  | 'seaphox_conductivity'
  | 'seaphox_oxygen'
>;

export const seaphoxConfig: Record<SeaphoxMetricsKeys, BaseSourceConfig> = {
  seaphox_external_ph: {
    title: 'pH',
    units: 'pH',
    description: '',
    visibility: 'public',
    order: 1,
    decimalPlaces: 4,
    yAxisStepSize: 0.01,
    yAxisMin: 7.95,
    yAxisMax: 8.05,
  },
  seaphox_pressure: {
    title: 'Pressure',
    units: 'dbar',
    description: '',
    visibility: 'public',
    order: 2,
    decimalPlaces: 3,
    yAxisStepSize: 0.2,
    yAxisPadding: 0.1,
  },
  seaphox_salinity: {
    title: 'Salinity',
    units: 'psu',
    description: '',
    visibility: 'public',
    order: 3,
    decimalPlaces: 4,
    yAxisStepSize: 0.01,
    yAxisPadding: 0.1,
  },
  seaphox_conductivity: {
    title: 'Conductivity',
    units: 'S/m',
    description: '',
    visibility: 'public',
    order: 4,
    decimalPlaces: 5,
    yAxisStepSize: 0.01,
    yAxisPadding: 0.1,
  },
  seaphox_oxygen: {
    title: 'Dissolved Oxygen',
    units: 'ml/L',
    description: '',
    visibility: 'public',
    order: 5,
    decimalPlaces: 3,
    yAxisStepSize: 0.1,
    yAxisPadding: 0.1,
  },
};

export function getSeapHOxConfig(configKey: SeaphoxMetricsKeys) {
  return seaphoxConfig[configKey] || {};
}

export function getPublicSeapHOxMetrics() {
  return Object.keys(seaphoxConfig).filter(
    (key) => seaphoxConfig[key as SeaphoxMetricsKeys].visibility === 'public',
  ) as SeaphoxMetricsKeys[];
}
