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
