import { Point } from 'geojson';
import { Reef } from '../reefs/reefs.entity';
import { SofarModels, sofarVariableIDs } from './constants';
import {
  getLatestData,
  getSofarDailyData,
  getSpotterData,
  sofarForecast,
} from './sofar';
import { SofarLiveData } from './sofar.types';
import { getDegreeHeatingDays } from '../workers/dailyData';

export const getLiveData = async (reef: Reef): Promise<SofarLiveData> => {
  const { polygon, spotterId, maxMonthlyMean } = reef;
  // TODO - Accept Polygon option
  const [longitude, latitude] = (polygon as Point).coordinates;

  const now = new Date();

  const spotterRawData = spotterId
    ? await getSpotterData(spotterId)
    : {
        surfaceTemperature: [],
        bottomTemperature: [],
        significantWaveHeight: [],
        wavePeakPeriod: [],
        waveMeanDirection: [],
      };

  const spotterData = {
    surfaceTemperature: getLatestData(spotterRawData.surfaceTemperature),
    bottomTemperature: getLatestData(spotterRawData.bottomTemperature),
    significantWaveHeight: getLatestData(spotterRawData.significantWaveHeight),
    wavePeakPeriod: getLatestData(spotterRawData.wavePeakPeriod),
    waveMeanDirection: getLatestData(spotterRawData.waveMeanDirection),
  };

  const degreeHeatingDays = await getDegreeHeatingDays(
    maxMonthlyMean,
    latitude,
    longitude,
    now,
  );

  const satelliteTemperature = getLatestData(
    await getSofarDailyData(
      SofarModels.NOAACoralReefWatch,
      sofarVariableIDs[SofarModels.NOAACoralReefWatch]
        .analysedSeaSurfaceTemperature,
      latitude,
      longitude,
      now,
      72,
    ),
  );

  const waveHeight =
    spotterData.significantWaveHeight ||
    (await sofarForecast(
      SofarModels.NOAAOperationalWaveModel,
      sofarVariableIDs[SofarModels.NOAAOperationalWaveModel]
        .significantWaveHeight,
      latitude,
      longitude,
    ));

  const waveDirection =
    spotterData.waveMeanDirection ||
    (await sofarForecast(
      SofarModels.NOAAOperationalWaveModel,
      sofarVariableIDs[SofarModels.NOAAOperationalWaveModel]
        .meanDirectionWindWaves,
      latitude,
      longitude,
    ));

  const wavePeriod =
    spotterData.wavePeakPeriod ||
    (await sofarForecast(
      SofarModels.NOAAOperationalWaveModel,
      sofarVariableIDs[SofarModels.NOAAOperationalWaveModel].peakPeriod,
      latitude,
      longitude,
    ));

  const windSpeed = await sofarForecast(
    SofarModels.GFS,
    sofarVariableIDs[SofarModels.GFS].magnitude10MeterWind,
    latitude,
    longitude,
  );

  const windDirection = await sofarForecast(
    SofarModels.GFS,
    sofarVariableIDs[SofarModels.GFS].direction10MeterWind,
    latitude,
    longitude,
  );

  return {
    reef: { id: reef.id },
    bottomTemperature: spotterData.bottomTemperature,
    surfaceTemperature: spotterData.surfaceTemperature,
    degreeHeatingDays,
    satelliteTemperature,
    waveHeight,
    waveDirection,
    wavePeriod,
    windSpeed,
    windDirection,
  };
};
