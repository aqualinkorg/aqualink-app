/** Worker to process daily data for all reefs. */
import { sum } from 'lodash';
import { Connection } from 'typeorm';
import { Point } from 'geojson';
import { Reef } from '../reefs/reefs.entity';
import { DailyData } from '../reefs/daily-data.entity';
import { getSofarDailyData, getSpotterData } from '../utils/sofar';
// import { calculateDegreeHeatingDays } from '../utils/temperature';

async function getDailyData(reef: Reef, date: Date) {
  const { polygon, spotterId, timezone: localTimezone } = reef;
  // TODO - Accept Polygon option
  const [longitude, latitude] = (polygon as Point).coordinates;

  const spotterData = await getSpotterData(spotterId, date);
  const minBottomTemperature = spotterId
    ? Math.min(...spotterData.bottomTemperature)
    : undefined;
  const maxBottomTemperature = spotterId
    ? Math.max(...spotterData.bottomTemperature)
    : undefined;
  const avgBottomTemperature = spotterId
    ? sum(spotterData.bottomTemperature) / spotterData.bottomTemperature.length
    : undefined;

  const surfaceTemperature = spotterId
    ? spotterData.surfaceTemperature
    : undefined;

  // Calculate Degree Heating Days
  // Calculating Degree Heating Days requires exactly 84 days of data.
  // TODO - Get data for the past 84 days.
  // const seaSurfaceTemperatures = [] as number[];
  // TODO - Add NOAA MMM to the reef table.
  // const MMM = 28;
  const degreeHeatingDays = 0; // calculateDegreeHeatingDays(seaSurfaceTemperatures, MMM);

  // Get satelliteTemperature close to midnight local time.
  const satelliteTemperature = (
    await getSofarDailyData(
      'HYCOM',
      'HYCOM-seaSurfaceTemperature',
      latitude,
      longitude,
      localTimezone,
      date,
    )
  ).slice(-1)[0].value;
  // Get NOAA waves data
  const significantWaveHeights = (
    await getSofarDailyData(
      'NOAAOperationalWaveModel',
      'NOAAOperationalWaveModel-significantWaveHeight',
      latitude,
      longitude,
      localTimezone,
      date,
    )
  ).map(({ value }) => value);

  const minWaveHeight = Math.min(...significantWaveHeights);
  const maxWaveHeight = Math.max(...significantWaveHeights);
  const avgWaveHeight =
    sum(significantWaveHeights) / significantWaveHeights.length;

  const meanDirectionWindWaves = (
    await getSofarDailyData(
      'NOAAOperationalWaveModel',
      'NOAAOperationalWaveModel-meanDirectionWindWaves',
      latitude,
      longitude,
      localTimezone,
      date,
    )
  ).map(({ value }) => value);

  const waveDirection = Math.round(
    sum(meanDirectionWindWaves) / meanDirectionWindWaves.length,
  );

  const meanPeriodWindWaves = (
    await getSofarDailyData(
      'NOAAOperationalWaveModel',
      'NOAAOperationalWaveModel-meanPeriodWindWaves',
      latitude,
      longitude,
      localTimezone,
      date,
    )
  ).map(({ value }) => value);

  const wavePeriod = Math.round(
    sum(meanPeriodWindWaves) / meanPeriodWindWaves.length,
  );

  // Get NOAA GFS wind data
  const windVelocities = (
    await getSofarDailyData(
      'GFS',
      'GFS-magnitude10MeterWind',
      latitude,
      longitude,
      localTimezone,
      date,
    )
  ).map(({ value }) => value);

  const minWindSpeed = Math.min(...windVelocities);
  const maxWindSpeed = Math.max(...windVelocities);
  const avgWindSpeed = sum(windVelocities) / windVelocities.length;

  const windDirections = (
    await getSofarDailyData(
      'GFS',
      'GFS-magnitude10MeterWind',
      latitude,
      longitude,
      localTimezone,
      date,
    )
  ).map(({ value }) => value);

  const windDirection = Math.round(sum(windDirections) / windDirections.length);

  return {
    reef,
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
  return Promise.all(
    allReefs.map(async (reef) => {
      const dailyDataInput = await getDailyData(reef, date);
      const entity = dailyDataRepository.create(dailyDataInput);
      try {
        const res = await dailyDataRepository.save(entity);
        return res;
      } catch (err) {
        // Update instead of insert
        if (err.constraint === 'no_duplicated_date') {
          const res = await dailyDataRepository.update(
            {
              reef,
              date: entity.date,
            },
            entity,
          );
          return res;
        }
        console.error(
          `Error updating data for Reef ${reef.id} & ${date}: ${err}.`,
        );
        return undefined;
      }
    }),
  );
}

/* eslint-disable no-console */
export async function runDailyUpdate(conn: Connection) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

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
