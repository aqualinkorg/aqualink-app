import { Point } from 'geojson';
import { isNil, omitBy } from 'lodash';
import { Reef } from '../reefs/reefs.entity';
import { SofarModels, sofarVariableIDs } from './constants';
import {
  getLatestData,
  getSofarHindcastData,
  getSpotterData,
  sofarForecast,
} from './sofar';
import { SofarLiveData } from './sofar.types';
import { getDegreeHeatingDays } from '../workers/dailyData';
import { calculateAlertLevel } from './bleachingAlert';

export const getLiveData = async (
  reef: Reef,
  includeSpotterData: boolean,
): Promise<SofarLiveData> => {
  const { polygon, spotterId, maxMonthlyMean } = reef;
  // TODO - Accept Polygon option
  const [longitude, latitude] = (polygon as Point).coordinates;

  const now = new Date();

  const [
    spotterRawData,
    degreeHeatingDays,
    satelliteTemperature,
    waveHeight,
    waveDirection,
    wavePeriod,
    windSpeed,
    windDirection,
  ] = await Promise.all([
    includeSpotterData ? getSpotterData(spotterId) : undefined,
    getDegreeHeatingDays(maxMonthlyMean, latitude, longitude, now),
    getSofarHindcastData(
      SofarModels.NOAACoralReefWatch,
      sofarVariableIDs[SofarModels.NOAACoralReefWatch]
        .analysedSeaSurfaceTemperature,
      latitude,
      longitude,
      now,
      72,
    ),
    sofarForecast(
      SofarModels.NOAAOperationalWaveModel,
      sofarVariableIDs[SofarModels.NOAAOperationalWaveModel]
        .significantWaveHeight,
      latitude,
      longitude,
    ),
    sofarForecast(
      SofarModels.NOAAOperationalWaveModel,
      sofarVariableIDs[SofarModels.NOAAOperationalWaveModel]
        .meanDirectionWindWaves,
      latitude,
      longitude,
    ),
    sofarForecast(
      SofarModels.NOAAOperationalWaveModel,
      sofarVariableIDs[SofarModels.NOAAOperationalWaveModel].peakPeriod,
      latitude,
      longitude,
    ),
    sofarForecast(
      SofarModels.GFS,
      sofarVariableIDs[SofarModels.GFS].magnitude10MeterWind,
      latitude,
      longitude,
    ),
    sofarForecast(
      SofarModels.GFS,
      sofarVariableIDs[SofarModels.GFS].direction10MeterWind,
      latitude,
      longitude,
    ),
  ]);

  const spotterData = spotterRawData
    ? {
        surfaceTemperature: getLatestData(spotterRawData.surfaceTemperature),
        bottomTemperature: getLatestData(spotterRawData.bottomTemperature),
        waveHeight: getLatestData(spotterRawData.significantWaveHeight),
        wavePeriod: getLatestData(spotterRawData.wavePeakPeriod),
        waveDirection: getLatestData(spotterRawData.waveMeanDirection),
        windSpeed: getLatestData(spotterRawData.windSpeed),
        windDirection: getLatestData(spotterRawData.windDirection),
        longitude:
          spotterRawData.longitude && getLatestData(spotterRawData.longitude),
        latitude:
          spotterRawData.latitude && getLatestData(spotterRawData.latitude),
      }
    : {};

  const filteredValues = omitBy(
    {
      degreeHeatingDays,
      satelliteTemperature:
        satelliteTemperature && getLatestData(satelliteTemperature),
      waveHeight,
      waveDirection,
      wavePeriod,
      windSpeed,
      windDirection,
      // Override all possible values with spotter data.
      ...spotterData,
    },
    (data) => isNil(data?.value) || data?.value === 9999,
  );

  const dailyAlertLevel = calculateAlertLevel(
    maxMonthlyMean,
    filteredValues?.satelliteTemperature?.value,
    degreeHeatingDays?.value,
  );

  return {
    reef: { id: reef.id },
    ...filteredValues,
    ...(spotterData.longitude &&
      spotterData.latitude && {
        spotterPosition: {
          longitude: spotterData.longitude,
          latitude: spotterData.latitude,
        },
      }),
    dailyAlertLevel,
  };
};
