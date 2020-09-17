/** Worker to process daily data for all reefs. */
import { isNil, omitBy } from 'lodash';
import { Connection } from 'typeorm';
import { Point } from 'geojson';
import Bluebird from 'bluebird';
import { Reef } from '../reefs/reefs.entity';
import { DailyData } from '../reefs/daily-data.entity';
import { getMin, getMax, getAverage } from '../utils/math';
import {
  extractSofarValues,
  getLatestDailyData,
  getSofarDailyData,
  getSpotterData,
} from '../utils/sofar';
import { calculateDegreeHeatingDays } from '../utils/temperature';
import { SofarDailyData, SofarModels, SofarValue } from '../utils/sofar.types';
import { sofarVariableIDs } from '../utils/constants';

export async function getDegreeHeatingDays(
  maxMonthlyMean: number,
  latitude: number,
  longitude: number,
  endOfDate: Date,
): Promise<SofarValue | undefined> {
  try {
    // TODO - Get data for the past 84 days.
    const seaSurfaceTemperatures = [] as number[];
    return {
      value: calculateDegreeHeatingDays(seaSurfaceTemperatures, maxMonthlyMean),
      timestamp: endOfDate.toISOString(),
    };
  } catch {
    const degreeHeatingWeek = await getSofarDailyData(
      SofarModels.NOAACoralReefWatch,
      sofarVariableIDs[SofarModels.NOAACoralReefWatch].degreeHeatingWeek,
      latitude,
      longitude,
      endOfDate,
      96,
    );

    // Check if there are any data returned
    // Grab the last one and convert it to degreeHeatingDays
    return degreeHeatingWeek.length > 0
      ? {
          value: getLatestDailyData(degreeHeatingWeek).value * 7,
          timestamp: getLatestDailyData(degreeHeatingWeek).timestamp,
        }
      : undefined;
  }
}

export async function getDailyData(
  reef: Reef,
  date: Date,
): Promise<SofarDailyData> {
  const { polygon, spotterId, maxMonthlyMean } = reef;
  // TODO - Accept Polygon option
  const [longitude, latitude] = (polygon as Point).coordinates;

  // Get the end of the day for the date.
  const endOfDate = new Date(date);
  endOfDate.setUTCHours(23, 59, 59, 59);

  const spotterRawData = spotterId
    ? await getSpotterData(spotterId, endOfDate)
    : {
        surfaceTemperature: [],
        bottomTemperature: [],
        significantWaveHeight: [],
        wavePeakPeriod: [],
        waveMeanDirection: [],
      };

  const spotterData = {
    surfaceTemperature: extractSofarValues(spotterRawData.surfaceTemperature),
    bottomTemperature: extractSofarValues(spotterRawData.bottomTemperature),
    significantWaveHeight: extractSofarValues(
      spotterRawData.significantWaveHeight,
    ),
    wavePeakPeriod: extractSofarValues(spotterRawData.wavePeakPeriod),
    waveMeanDirection: extractSofarValues(spotterRawData.waveMeanDirection),
  };

  const minBottomTemperature = getMin(spotterData.bottomTemperature);
  const maxBottomTemperature = getMax(spotterData.bottomTemperature);
  const avgBottomTemperature = getAverage(spotterData.bottomTemperature);

  const surfaceTemperature = getAverage(spotterData.surfaceTemperature);

  // Calculate Degree Heating Days
  // Calculating Degree Heating Days requires exactly 84 days of data.
  const degreeHeatingDays = (
    await getDegreeHeatingDays(maxMonthlyMean, latitude, longitude, endOfDate)
  )?.value;

  const satelliteTemperatureData = await getSofarDailyData(
    SofarModels.NOAACoralReefWatch,
    sofarVariableIDs[SofarModels.NOAACoralReefWatch]
      .analysedSeaSurfaceTemperature,
    latitude,
    longitude,
    endOfDate,
    48,
  );

  // Get satelliteTemperature
  const satelliteTemperature =
    satelliteTemperatureData.length > 0
      ? getLatestDailyData(satelliteTemperatureData).value
      : undefined;

  // Get waves data if unavailable through a spotter
  const significantWaveHeights =
    spotterData.significantWaveHeight.length > 0
      ? spotterData.significantWaveHeight
      : (
          await getSofarDailyData(
            SofarModels.NOAAOperationalWaveModel,
            sofarVariableIDs[SofarModels.NOAAOperationalWaveModel]
              .significantWaveHeight,
            latitude,
            longitude,
            endOfDate,
          )
        ).map(({ value }) => value);

  const minWaveHeight = getMin(significantWaveHeights);
  const maxWaveHeight = getMax(significantWaveHeights);
  const avgWaveHeight = getAverage(significantWaveHeights);

  const meanDirectionWindWaves =
    spotterData.waveMeanDirection.length > 0
      ? spotterData.waveMeanDirection
      : (
          await getSofarDailyData(
            SofarModels.NOAAOperationalWaveModel,
            sofarVariableIDs[SofarModels.NOAAOperationalWaveModel]
              .meanDirectionWindWaves,
            latitude,
            longitude,
            endOfDate,
          )
        ).map(({ value }) => value);

  const waveDirection = getAverage(meanDirectionWindWaves, true);

  const peakPeriodWindWaves =
    spotterData.wavePeakPeriod.length > 0
      ? spotterData.wavePeakPeriod
      : (
          await getSofarDailyData(
            SofarModels.NOAAOperationalWaveModel,
            sofarVariableIDs[SofarModels.NOAAOperationalWaveModel].peakPeriod,
            latitude,
            longitude,
            endOfDate,
          )
        ).map(({ value }) => value);

  const wavePeriod = getAverage(peakPeriodWindWaves, true);

  // Get NOAA GFS wind data
  const windVelocities = (
    await getSofarDailyData(
      SofarModels.GFS,
      sofarVariableIDs[SofarModels.GFS].magnitude10MeterWind,
      latitude,
      longitude,
      endOfDate,
    )
  ).map(({ value }) => value);

  const minWindSpeed = getMin(windVelocities);
  const maxWindSpeed = getMax(windVelocities);
  const avgWindSpeed = getAverage(windVelocities);

  const windDirections = (
    await getSofarDailyData(
      SofarModels.GFS,
      sofarVariableIDs[SofarModels.GFS].direction10MeterWind,
      latitude,
      longitude,
      endOfDate,
    )
  ).map(({ value }) => value);

  const windDirection = getAverage(windDirections, true);

  return {
    reef: { id: reef.id },
    date,
    minBottomTemperature,
    maxBottomTemperature,
    avgBottomTemperature,
    surfaceTemperature,
    satelliteTemperature,
    degreeHeatingDays,
    minWaveHeight,
    maxWaveHeight,
    avgWaveHeight,
    waveDirection,
    wavePeriod,
    minWindSpeed,
    maxWindSpeed,
    avgWindSpeed,
    windDirection,
  };
}

export async function getReefsDailyData(connection: Connection, date: Date) {
  const reefRepository = connection.getRepository(Reef);
  const dailyDataRepository = connection.getRepository(DailyData);
  const allReefs = await reefRepository.find();
  const start = new Date();
  console.log(`Updating ${allReefs.length} reefs for ${date.toDateString()}.`);
  await Bluebird.map(
    allReefs,
    async (reef) => {
      const dailyDataInput = await getDailyData(reef, date);
      const entity = dailyDataRepository.create(dailyDataInput);
      try {
        await dailyDataRepository.save(entity);
      } catch (err) {
        // Update instead of insert
        if (err.constraint === 'no_duplicated_date') {
          const filteredData = omitBy(entity, isNil);

          await dailyDataRepository.update(
            {
              reef,
              date: entity.date,
            },
            filteredData,
          );
          return;
        }
        console.error(
          `Error updating data for Reef ${reef.id} & ${date}: ${err}.`,
        );
      }
    },
    { concurrency: 8 },
  );
  console.log(
    `Updated ${allReefs.length} reefs in ${
      (new Date().valueOf() - start.valueOf()) / 1000
    } seconds`,
  );
}

/* eslint-disable no-console */
export async function runDailyUpdate(conn: Connection) {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  console.log(`Daily Update for data on ${yesterday.toDateString()}`);
  try {
    await getReefsDailyData(conn, yesterday);
    console.log('Completed daily update.');
  } catch (error) {
    console.error(error);
  }
}
/* eslint-enable no-console */
