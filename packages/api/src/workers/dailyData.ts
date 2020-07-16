/** Worker to process daily data for all reefs. */
import { sum } from 'lodash';
import { Reef } from '../reefs/reefs.entity';
import { getSofarDailyData, getSpotterData } from '../utils/sofar';
import { calculateDegreeHeatingDays } from '../utils/temperature';
import { InsertDailyData } from '../reefs/dto/insert-daily-data.dto';

async function getDailyData(reef: Reef, date: Date): Promise<InsertDailyData> {
  const { polygon, spotterId } = reef;
  const [longitude, latitude] = polygon.coordinates;

  // Get Spotter Data
  const spotterData =
    spotterId && (await getSpotterData('reef.spotterId', date));
  const minBottomTemperature =
    spotterId && Math.min(...spotterData.bottomTemperature);
  const maxBottomTemperature =
    spotterId && Math.max(...spotterData.bottomTemperature);
  const avgBottomTemperature =
    spotterId &&
    sum(spotterData.bottomTemperature) / spotterData.bottomTemperature.length;

  const surfaceTemperature = spotterId && spotterData.surfaceTemperature;

  // Calculate Degree Heating Days
  // Calculating Degree Heating Days requires exactly 84 days of data.
  // TODO - Get data for the past 84 days.
  const seaSurfaceTemperatures = [];
  // TODO - Add NOAA MMM to the reef table.
  const MMM = 28;
  const degreeHeatingDays = calculateDegreeHeatingDays(
    seaSurfaceTemperatures,
    MMM,
  );

  // Get satelliteTemperature close to midnight local time.
  const satelliteTemperature = await getSofarDailyData(
    'HYCOM',
    'HYCOM-seaSurfaceTemperature',
    latitude,
    longitude,
    date,
  )[-1].value;

  // Get NOAA waves data
  const significantWaveHeights = (
    await getSofarDailyData(
      'NOAAOperationalWaveModel',
      'NOAAOperationalWaveModel-significantWaveHeight',
      latitude,
      longitude,
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
      date,
    )
  ).map(({ value }) => value);

  const waveDirection =
    sum(meanDirectionWindWaves) / meanDirectionWindWaves.length;

  const meanPeriodWindWaves = (
    await getSofarDailyData(
      'NOAAOperationalWaveModel',
      'NOAAOperationalWaveModel-meanPeriodWindWaves',
      latitude,
      longitude,
      date,
    )
  ).map(({ value }) => value);

  const wavePeriod = sum(meanPeriodWindWaves) / meanPeriodWindWaves.length;

  // Get NOAA GFS wind data
  const windVelocities = (
    await getSofarDailyData(
      'GFS',
      'GFS-magnitude10MeterWind',
      latitude,
      longitude,
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
      date,
    )
  ).map(({ value }) => value);

  const windDirection = sum(windDirections) / windDirections.length;

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

async function getReefsDailyData(date: Date) {
  // TODO: implement loop
  // for reef in reefs: dailyData = getDailyData(reef: Reef, date: Date), insert in DB
  // TODO - Prevent duplicate inserts on (reef_id, date)
}

async function run() {
  const today = new Date();
  await getReefsDailyData(today);
}

run();
