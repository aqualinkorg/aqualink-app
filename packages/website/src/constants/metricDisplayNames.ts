// FILE: packages/website/src/constants/metricDisplayNames.ts
// Display names for SeapHOx metrics only
// This allows showing "pH (External)" instead of "seaphox_external_ph" in the UI

export const SEAPHOX_METRIC_DISPLAY_NAMES: Record<string, string> = {
  seaphox_temperature: 'Temperature',
  seaphox_external_ph: 'pH (External)',
  seaphox_internal_ph: 'pH (Internal)',
  seaphox_external_ph_volt: 'pH Voltage (External)',
  seaphox_internal_ph_volt: 'pH Voltage (Internal)',
  seaphox_ph_temperature: 'pH Sensor Temp',
  seaphox_pressure: 'Pressure',
  seaphox_salinity: 'Salinity',
  seaphox_conductivity: 'Conductivity',
  seaphox_oxygen: 'Dissolved O₂',
  seaphox_relative_humidity: 'Relative Humidity',
  seaphox_sample_number: 'Sample Number',
  seaphox_error_flags: 'Error Flags',
  seaphox_int_temperature: 'Internal Temp',
};

/**
 * Get user-friendly display name for a SeapHOx metric
 */
export const getSeapHOxDisplayName = (metric: string): string => {
  return SEAPHOX_METRIC_DISPLAY_NAMES[metric] || metric;
};

/**
 * Get metric units for SeapHOx sensors
 */
export const SEAPHOX_METRIC_UNITS: Record<string, string> = {
  seaphox_temperature: '°C',
  seaphox_external_ph: 'pH',
  seaphox_internal_ph: 'pH',
  seaphox_external_ph_volt: 'V',
  seaphox_internal_ph_volt: 'V',
  seaphox_ph_temperature: '°C',
  seaphox_pressure: 'dbar',
  seaphox_salinity: 'PSU',
  seaphox_conductivity: 'S/m',
  seaphox_oxygen: 'ml/L',
  seaphox_relative_humidity: '%',
  seaphox_int_temperature: '°C',
};

export const getSeapHOxUnit = (metric: string): string => {
  return SEAPHOX_METRIC_UNITS[metric] || '';
};
