import { Point } from 'geojson';
import { Reef } from '../reefs/reefs.entity';
import { sofarVariableIDs } from './constants';
import {
  getLatestDailyData,
  getSofarDailyData,
  getSpotterData,
  sofarForecast,
} from './sofar';
import { SofarLiveData, SofarModels } from './sofar.types';
import { getDegreeHeatingDays } from '../workers/dailyData';

export const getLiveData = async (reef: Reef): Promise<SofarLiveData> => {
  const { polygon, spotterId, maxMonthlyMean } = reef;
  // TODO - Accept Polygon option
  const [longitude, latitude] = (polygon as Point).coordinates;

  const endOfDate = new Date();

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
    surfaceTemperature: getLatestDailyData(spotterRawData.surfaceTemperature),
    bottomTemperature: getLatestDailyData(spotterRawData.bottomTemperature),
    significantWaveHeight: getLatestDailyData(
      spotterRawData.significantWaveHeight,
    ),
    wavePeakPeriod: getLatestDailyData(spotterRawData.wavePeakPeriod),
    waveMeanDirection: getLatestDailyData(spotterRawData.waveMeanDirection),
  };

  const degreeHeatingDays = await getDegreeHeatingDays(
    maxMonthlyMean,
    latitude,
    longitude,
    endOfDate,
  );

  const satelliteTemperature = getLatestDailyData(
    await getSofarDailyData(
      SofarModels.NOAACoralReefWatch,
      sofarVariableIDs[SofarModels.NOAACoralReefWatch]
        .analysedSeaSurfaceTemperature,
      latitude,
      longitude,
      endOfDate,
      96,
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
