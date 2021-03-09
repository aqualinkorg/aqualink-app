import { Point } from 'geojson';
import { isNil, omitBy, keyBy } from 'lodash';
import moment from 'moment';
import { Reef } from '../reefs/reefs.entity';
import { SofarModels, sofarVariableIDs } from './constants';
import {
  getLatestData,
  getSofarHindcastData,
  getSpotterData,
  sofarForecast,
} from './sofar';
import { SofarLiveData, SofarValue } from './sofar.types';
import { getDegreeHeatingDays } from '../workers/dailyData';
import { calculateAlertLevel } from './bleachingAlert';
import { MonthlyMax } from '../reefs/monthly-max.entity';

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

/**
 * The daily global 5km SSTA product requires a daily climatology to calculate the daily SST anomalies.
 * Daily climatologies (DC) are derived from the monthly mean (MM) climatology via linear interpolation.
 * To achieve this, we assigned the MM value to the 15th day of each corresponding month, with the individual
 * days between these dates being derived using linear interpolation. We then calculate the SSTA product using:
 *
 * ST_anomaly = SST - DC
 *
 * where the SST is the value for the day in question, and DC is the corresponding daily climatology for that
 * day of the year.
 * */
export const findSstAnomaly = (
  monthlyMax: MonthlyMax[],
  satelliteTemperature?: SofarValue,
) => {
  if (monthlyMax.length === 0 || !satelliteTemperature) {
    return undefined;
  }

  const groupedByMonth = keyBy(monthlyMax, 'month');

  const now = moment().startOf('day');
  const currentDate = now.date();

  const start = now.clone().set('date', 15);

  const end =
    currentDate > 15
      ? now.clone().add(1, 'month').set('date', 15).startOf('day')
      : now.clone().subtract(1, 'month').set('date', 15).startOf('day');

  const startPoint = {
    x: start,
    y: groupedByMonth[1 + start.month()].temperature,
  };
  const endPoint = { x: end, y: groupedByMonth[1 + end.month()].temperature };

  const slope =
    (endPoint.y - startPoint.y) / endPoint.x.diff(startPoint.x, 'days');

  const interpolated = endPoint.y + slope * now.diff(endPoint.x, 'days');

  return satelliteTemperature.value - interpolated;
};
