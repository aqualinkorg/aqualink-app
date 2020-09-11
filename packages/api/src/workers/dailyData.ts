/** Worker to process daily data for all reefs. */
import { isNil, omitBy } from 'lodash';
import { Connection } from 'typeorm';
import { Point } from 'geojson';
import Bluebird from 'bluebird';
import { Reef } from '../reefs/reefs.entity';
import { DailyData } from '../reefs/daily-data.entity';
import { getMin, getMax, getAverage } from '../utils/maths';
import { getSofarDailyData, getSpotterData } from '../utils/sofar';
import { calculateDegreeHeatingDays } from '../utils/temperature';

export async function getDailyData(reef: Reef, date: Date) {
  const { polygon, spotterId, maxMonthlyMean } = reef;
  // TODO - Accept Polygon option
  const [longitude, latitude] = (polygon as Point).coordinates;
  const timezone = '';

  const spotterData = spotterId
    ? await getSpotterData(spotterId, timezone, date)
    : {
        surfaceTemperature: [],
        bottomTemperature: [],
        significantWaveHeight: [],
        wavePeakPeriod: [],
        waveMeanDirection: [],
      };

  const minBottomTemperature = getMin(spotterData.bottomTemperature);
  const maxBottomTemperature = getMax(spotterData.bottomTemperature);
  const avgBottomTemperature = getAverage(spotterData.bottomTemperature);

  const surfaceTemperature = getAverage(spotterData.surfaceTemperature);

  // Calculate Degree Heating Days
  // Calculating Degree Heating Days requires exactly 84 days of data.
  let degreeHeatingDays: number | undefined;
  try {
    // TODO - Get data for the past 84 days.
    const seaSurfaceTemperatures = [] as number[];
    degreeHeatingDays = calculateDegreeHeatingDays(
      seaSurfaceTemperatures,
      maxMonthlyMean,
    );
  } catch {
    const degreeHeatingWeek = await getSofarDailyData(
      'NOAACoralReefWatch',
      'degreeHeatingWeek',
      latitude,
      longitude,
      timezone,
      date,
      96,
    );

    degreeHeatingDays =
      degreeHeatingWeek.length > 0
        ? degreeHeatingWeek.slice(-1)[0].value * 7
        : undefined;
  }

  const satelliteTemperatureData = await getSofarDailyData(
    'NOAACoralReefWatch',
    'analysedSeaSurfaceTemperature',
    latitude,
    longitude,
    timezone,
    date,
    48,
  );

  // Get satelliteTemperature
  const satelliteTemperature =
    (satelliteTemperatureData &&
      satelliteTemperatureData.length > 0 &&
      satelliteTemperatureData.slice(-1)[0].value) ||
    undefined;

  // Get waves data if unavailable through a spotter
  const significantWaveHeights =
    spotterData.significantWaveHeight.length > 0
      ? spotterData.significantWaveHeight
      : (
          await getSofarDailyData(
            'NOAAOperationalWaveModel',
            'NOAAOperationalWaveModel-significantWaveHeight',
            latitude,
            longitude,
            timezone,
            date,
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
            'NOAAOperationalWaveModel',
            'NOAAOperationalWaveModel-meanDirectionWindWaves',
            latitude,
            longitude,
            timezone,
            date,
          )
        ).map(({ value }) => value);

  const waveDirection = getAverage(meanDirectionWindWaves, true);

  const peakPeriodWindWaves =
    spotterData.wavePeakPeriod.length > 0
      ? spotterData.wavePeakPeriod
      : (
          await getSofarDailyData(
            'NOAAOperationalWaveModel',
            'NOAAOperationalWaveModel-peakPeriod',
            latitude,
            longitude,
            timezone,
            date,
          )
        ).map(({ value }) => value);

  const wavePeriod = getAverage(peakPeriodWindWaves, true);

  // Get NOAA GFS wind data
  const windVelocities = (
    await getSofarDailyData(
      'GFS',
      'GFS-magnitude10MeterWind',
      latitude,
      longitude,
      timezone,
      date,
    )
  ).map(({ value }) => value);

  const minWindSpeed = getMin(windVelocities);
  const maxWindSpeed = getMax(windVelocities);
  const avgWindSpeed = getAverage(windVelocities);

  const windDirections = (
    await getSofarDailyData(
      'GFS',
      'GFS-direction10MeterWind',
      latitude,
      longitude,
      timezone,
      date,
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
  console.log(`Updating ${allReefs.length} reefs.`);
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
