import { BaseSourceConfig, createSubMetricsKeysArray } from 'utils/types';

export const DEFAULT_METRICS = createSubMetricsKeysArray(
  'bottom_temperature',
  'top_temperature',
  'wind_speed',
  'significant_wave_height',
  'barometric_pressure_top',
  'barometric_pressure_bottom',
  'surface_temperature',
);

export type SpotterMetricsKeys = typeof DEFAULT_METRICS[number];

const spotterConfig: Record<SpotterMetricsKeys, BaseSourceConfig> = {
  top_temperature: {
    units: '°C',
    title: 'Top Temperature',
    description: '',
    visibility: 'none',
    order: 1,
  },
  bottom_temperature: {
    units: '°C',
    title: 'Bottom temperature',
    description: '',
    visibility: 'none',
    order: 1,
  },
  wind_speed: {
    units: 'km/h',
    title: 'Wind Speed',
    // convert from m/s to to km/h
    convert: 3.6,
    description: '',
    visibility: 'public',
    order: 1,
  },
  barometric_pressure_top: {
    units: 'hPa',
    title: 'Surface Barometric Pressure',
    description: '',
    visibility: 'public',
    order: 2,
  },
  barometric_pressure_bottom: {
    units: 'hPa',
    title: 'Bottom Pressure',
    description: '',
    visibility: 'public',
    order: 3,
  },
  significant_wave_height: {
    units: 'm',
    title: 'Significant Wave Height',
    description: '',
    visibility: 'public',
    order: 4,
  },
  surface_temperature: {
    units: '°C',
    title: 'Surface Temperature',
    description: '',
    visibility: 'public',
    order: 5,
  },
};

export function getSpotterConfig(configKey: SpotterMetricsKeys) {
  return spotterConfig[configKey] || {};
}

export function getPublicSpotterMetrics() {
  return Object.keys(spotterConfig).filter(
    (key) => spotterConfig[key as SpotterMetricsKeys].visibility === 'public',
  ) as SpotterMetricsKeys[];
}
