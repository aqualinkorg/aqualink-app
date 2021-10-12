// dotenv is a dev dependency, so conditionally import it (don't need it in Prod).
try {
  // eslint-disable-next-line import/no-extraneous-dependencies, global-require
  require('dotenv').config();
} catch {
  // Pass
}

// Sofar API urls and token
export const { SOFAR_API_TOKEN } = process.env;
export const SOFAR_MARINE_URL =
  'https://api.sofarocean.com/marine-weather/v1/models/';
export const SOFAR_WAVE_DATA_URL = 'https://api.sofarocean.com/api/wave-data';
export const SOFAR_SENSOR_DATA_URL =
  'https://api.sofarocean.com/api/sensor-data';

export enum SofarModels {
  SofarOperationalWaveModel = 'SofarOperationalWaveModel',
  NOAACoralSiteWatch = 'NOAACoralSiteWatch',
  GFS = 'GFS',
}

// Sofar variables
export const sofarVariableIDs = {
  [SofarModels.SofarOperationalWaveModel]: {
    significantWaveHeight: 'significantWaveHeight',
    meanDirectionWindWaves: 'meanDirectionWindWaves',
    peakPeriod: 'peakPeriod',
  },
  [SofarModels.NOAACoralSiteWatch]: {
    degreeHeatingWeek: 'degreeHeatingWeek',
    analysedSeaSurfaceTemperature: 'analysedSeaSurfaceTemperature',
  },
  [SofarModels.GFS]: {
    magnitude10MeterWind: 'magnitude10MeterWind',
    direction10MeterWind: 'direction10MeterWind',
  },
};
