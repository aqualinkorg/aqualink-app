import { MetricsKeys } from 'store/Sites/types';
import { BaseSourceConfig } from '../../utils/types';

export type MetlogMetricsKeys = Extract<
  MetricsKeys,
  | 'wind_direction'
  | 'wind_speed'
  | 'air_temperature'
  | 'pressure'
  | 'precipitation'
  | 'rh'
  | 'wind_gust_speed'
>;

export const metlogConfig: Record<MetlogMetricsKeys, BaseSourceConfig> = {
  air_temperature: {
    title: 'Air Temperature',
    units: '°C',
    description: '',
    visibility: 'public',
    order: 4,
  },
  rh: {
    title: 'Relative Humidity',
    units: '%',
    description: '',
    visibility: 'public',
    order: 4,
  },
  precipitation: {
    title: 'Precipitation',
    units: 'mm',
    description: '',
    visibility: 'public',
    order: 4,
  },
  wind_speed: {
    title: 'Wind Speed',
    units: 'km/h',
    description: '',
    visibility: 'public',
    order: 4,
    convert: 3.6,
  },
  wind_gust_speed: {
    title: 'Wind Gust Speed',
    units: 'km/h',
    description: '',
    visibility: 'public',
    order: 4,
    convert: 3.6,
  },
  wind_direction: {
    title: 'Wind Direction',
    units: '°',
    description: '',
    visibility: 'public',
    order: 4,
  },
  pressure: {
    title: 'Pressure',
    units: 'mbar',
    description: '',
    visibility: 'public',
    order: 4,
  },
};

export function getMetlogConfig(configKey: MetlogMetricsKeys) {
  return metlogConfig[configKey] || {};
}

export function getPublicMetlogMetrics() {
  return Object.keys(metlogConfig).filter(
    (key) => metlogConfig[key as MetlogMetricsKeys].visibility === 'public',
  ) as MetlogMetricsKeys[];
}
