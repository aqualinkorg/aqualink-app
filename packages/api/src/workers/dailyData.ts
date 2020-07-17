/** Worker to process daily data for all reefs. */
import { sum, get } from 'lodash';
import { createConnection } from 'typeorm';
import { Reef } from '../reefs/reefs.entity';
import { DailyData } from '../reefs/daily-data.entity';
import { getSofarDailyData, getSpotterData } from '../utils/sofar';
// import { calculateDegreeHeatingDays } from '../utils/temperature';
const dbConfig = require('../../ormconfig');

async function getDailyData(reef: Reef, date: Date): Promise<any> {
  const { polygon, spotterId } = reef;
  const [longitude, latitude] = get(polygon, 'coordinates');
  // Get Spotter Data
  const spotterData = await getSpotterData('reef.spotterId', date);
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
  const seaSurfaceTemperatures = [] as number[];
  // TODO - Add NOAA MMM to the reef table.
  const MMM = 28;
  const degreeHeatingDays = 0; // calculateDegreeHeatingDays(seaSurfaceTemperatures, MMM);

  // Get satelliteTemperature close to midnight local time.
  console.log('get satellite Temperature');
  const satelliteTemperature = (
    await getSofarDailyData(
      'HYCOM',
      'HYCOM-seaSurfaceTemperature',
      latitude,
      longitude,
      date,
    )
  ).slice(-1)[0].value;
  console.log(satelliteTemperature);
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

  const waveDirection = Math.round(
    sum(meanDirectionWindWaves) / meanDirectionWindWaves.length,
  );

  const meanPeriodWindWaves = (
    await getSofarDailyData(
      'NOAAOperationalWaveModel',
      'NOAAOperationalWaveModel-meanPeriodWindWaves',
      latitude,
      longitude,
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

async function getReefsDailyData(date: Date) {
  // TODO: implement loop
  // TODO - Prevent duplicate inserts on (reef_id, date)
  createConnection(dbConfig).then(async (connection) => {
    const reefRepository = connection.getRepository(Reef);
    const dailyDataRepository = connection.getRepository(DailyData);
    const allReefs = await reefRepository.find();
    allReefs.forEach(async (reef) => {
      const dailyDataInput = await getDailyData(reef, date);
      const dailyDataEntities = dailyDataRepository.create(dailyDataInput);
      dailyDataRepository.save(dailyDataEntities);
    });
  });
}

async function run() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  await getReefsDailyData(yesterday);
}

run();
