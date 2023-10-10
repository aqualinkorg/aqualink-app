import { MetricsKeys } from 'store/Sites/types';
import { BaseSourceConfig } from '../../utils/types';

export type SondeMetricsKeys = Extract<
  MetricsKeys,
  | 'salinity'
  | 'turbidity'
  | 'bottom_temperature'
  | 'odo_saturation'
  | 'ph'
  | 'cholorophyll_rfu'
  | 'cholorophyll_concentration'
  | 'conductivity'
  | 'water_depth'
  | 'odo_concentration'
  | 'specific_conductance'
  | 'tds'
  | 'total_suspended_solids'
  | 'sonde_wiper_position'
  | 'ph_mv'
  | 'sonde_battery_voltage'
  | 'sonde_cable_power_voltage'
>;

export const sondeConfig: Record<SondeMetricsKeys, BaseSourceConfig> = {
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
  bottom_temperature: {
    title: 'Temperature at Depth',
    units: '°C',
    description: '',
    visibility: 'public',
    order: 4,
  },
  odo_saturation: {
    title: 'Optical Dissolved Oxygen (saturation)',
    units: '% sat',
    description: '',
    visibility: 'public',
    order: 4,
  },
  ph: {
    title: 'Acidity',
    units: 'pH',
    description: '',
    visibility: 'public',
    order: 5,
  },
  cholorophyll_rfu: {
    title: 'Chlorophyll Relative Fluorescence',
    units: 'RFU',
    description: '',
    visibility: 'public',
    order: 8,
  },
  cholorophyll_concentration: {
    title: 'Chlorophyll Concentration',
    units: 'µg/L',
    description: '',
    visibility: 'public',
    order: 7,
  },
  conductivity: {
    title: 'Conductivity',
    units: 'µS/cm',
    description: '',
    visibility: 'public',
    order: 8,
  },
  water_depth: {
    title: 'Depth',
    units: 'm',
    description: '',
    visibility: 'public',
    order: 7,
  },
  odo_concentration: {
    title: 'Optical Dissolved Oxygen (concentration)',
    units: 'mg/L',
    description: '',
    visibility: 'public',
    order: 7,
  },
  specific_conductance: {
    title: 'Specific Conductance',
    units: 'µS/cm',
    description: '',
    visibility: 'public',
    order: 8,
  },
  tds: {
    title: 'Concentration of Dissolved Particles (TDS)',
    units: 'mg/L',
    description: '',
    visibility: 'public',
    order: 8,
  },
  total_suspended_solids: {
    title: 'Total Suspended Solids',
    units: 'mg/L',
    description: '',
    visibility: 'public',
    order: 8,
  },
  sonde_wiper_position: {
    title: 'Sonde Wiper Position',
    units: 'V',
    description: '',
    visibility: 'admin',
    order: 8,
  },
  ph_mv: {
    title: 'Acidity Conrol Voltage',
    units: 'mV',
    description: '',
    visibility: 'admin',
    order: 8,
  },
  sonde_battery_voltage: {
    title: 'Sonde Battery',
    units: 'V',
    description: '',
    visibility: 'admin',
    order: 9,
  },
  sonde_cable_power_voltage: {
    title: 'Sonder Cable Power Voltage',
    units: 'V',
    description: '',
    visibility: 'admin',
    order: 9,
  },
};

export function getSondeConfig(configKey: SondeMetricsKeys) {
  return sondeConfig[configKey] || {};
}

export function getPublicSondeMetrics() {
  return Object.keys(sondeConfig).filter(
    (key) => sondeConfig[key as SondeMetricsKeys].visibility === 'public',
  ) as SondeMetricsKeys[];
}
