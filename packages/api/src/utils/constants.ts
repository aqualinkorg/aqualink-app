// dotenv is a dev dependency, so conditionally import it (don't need it in Prod).
try {
  // eslint-disable-next-line import/no-extraneous-dependencies, global-require
  require('dotenv').config();
} catch {
  // Pass
}
export const envName = process.env.NODE_ENV || 'development';
export const isTestEnv = envName === 'test';

// Environment variables (especially those used by cloud-functions)
// should NOT be exported from here (eg. "export const { SOFAR_API_TOKEN } = process.env"),
// since it will interfere with the way they are set in cloud-functions,
// causing them to be undefined.

// Sofar API urls
export const SOFAR_MARINE_URL =
  'https://api.sofarocean.com/marine-weather/v1/models/';
export const SOFAR_WAVE_DATA_URL = 'https://api.sofarocean.com/api/wave-data';
export const SOFAR_SENSOR_DATA_URL =
  'https://api.sofarocean.com/api/sensor-data';
export const SOFAR_LATEST_DATA_URL =
  'https://api.sofarocean.com/api/latest-data';

// Open-Meteo Marine API
// https://open-meteo.com/en/docs/marine-weather-api
// Free tier (default) requires no auth. Setting OPEN_METEO_API_KEY routes
// requests to the customer endpoint. Setting OPEN_METEO_BASE_URL overrides both.
export const OPEN_METEO_FREE_URL =
  'https://marine-api.open-meteo.com/v1/marine';
export const OPEN_METEO_CUSTOMER_URL =
  'https://customer-marine-api.open-meteo.com/v1/marine';

// Number of sites to bundle into a single multi-coordinate Marine API call.
// 100 keeps URL length safely under typical proxy limits (~8KB).
export const OPEN_METEO_BATCH_SIZE = 100;

// Concurrency cap for parallel Open-Meteo batch calls. The free tier allows
// 600 calls/min; this leaves plenty of headroom.
export const OPEN_METEO_CONCURRENCY = 20;

export enum SofarModels {
  NOAACoralReefWatch = 'NOAACoralReefWatch',
  Wave = 'Wave',
  Atmosphere = 'Atmosphere',
}

// Sofar variables
export const sofarVariableIDs = {
  [SofarModels.Wave]: {
    significantWaveHeight: 'significantWaveHeight',
    meanDirection: 'meanDirection',
    meanDirectionalSpread: 'meanDirectionalSpread',
    meanPeriod: 'meanPeriod',
    peakFrequency: 'peakFrequency',
    peakDirection: 'peakDirection',
    significantWaveHeightWindWaves: 'significantWaveHeightWindWaves',
    meanDirectionWindWaves: 'meanDirectionWindWaves',
    meanDirectionalSpreadWindWaves: 'meanDirectionalSpreadWindWaves',
    peakPeriodWindWaves: 'peakPeriodWindWaves',
    significantWaveHeightFirstSwell: 'significantWaveHeightFirstSwell',
    meanDirectionFirstSwell: 'meanDirectionFirstSwell',
    meanDirectionalSpreadFirstSwell: 'meanDirectionalSpreadFirstSwell',
    peakPeriodFirstSwell: 'peakPeriodFirstSwell',
    significantWaveHeightSecondSwell: 'significantWaveHeightSecondSwell',
    meanDirectionSecondSwell: 'meanDirectionSecondSwell',
    meanDirectionalSpreadSecondSwell: 'meanDirectionalSpreadSecondSwell',
    peakPeriodSecondSwell: 'peakPeriodSecondSwell',
  },
  [SofarModels.NOAACoralReefWatch]: {
    degreeHeatingWeek: 'degreeHeatingWeek',
    analysedSeaSurfaceTemperature: 'analysedSeaSurfaceTemperature',
  },
  [SofarModels.Atmosphere]: {
    windVelocity10MeterEastward: 'windVelocity10MeterEastward',
    windVelocity10MeterNorthward: 'windVelocity10MeterNorthward',
  },
};

export const STORM_GLASS_BASE_URL = 'https://api.stormglass.io/v2';
