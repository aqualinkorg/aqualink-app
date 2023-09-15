/** Worker to process daily data for all sites. */
import {
  get,
  isEmpty,
  isNil,
  isNumber,
  isUndefined,
  mapValues,
  omit,
  omitBy,
} from 'lodash';
import { DataSource, In, Repository } from 'typeorm';
import { Point } from 'geojson';
import Bluebird from 'bluebird';
import { DateTime } from 'luxon';
import { Site } from '../sites/sites.entity';
import { DailyData } from '../sites/daily-data.entity';
import {
  getMin,
  getMax,
  getAverage,
  getWindSpeed,
  getWindDirection,
} from '../utils/math';
import {
  extractSofarValues,
  getLatestData,
  getSofarHindcastData,
  getSpotterData,
} from '../utils/sofar';
import { calculateDegreeHeatingDays } from '../utils/temperature';
import {
  DEFAULT_SPOTTER_DATA_VALUE,
  SofarDailyData,
  ValueWithTimestamp,
} from '../utils/sofar.types';
import { SofarModels, sofarVariableIDs } from '../utils/constants';
import { calculateAlertLevel } from '../utils/bleachingAlert';
import { ExclusionDates } from '../sites/exclusion-dates.entity';
import {
  filterMetricDataByDate,
  getAllColumns,
  getExclusionDates,
} from '../utils/site.utils';

export async function getDegreeHeatingDays(
  latitude: number,
  longitude: number,
  endOfDate: Date,
  maxMonthlyMean: number | null,
): Promise<ValueWithTimestamp | undefined> {
  try {
    // TODO - Get data for the past 84 days.
    const seaSurfaceTemperatures = [] as number[];
    return {
      value: calculateDegreeHeatingDays(seaSurfaceTemperatures, maxMonthlyMean),
      timestamp: endOfDate.toISOString(),
    };
  } catch {
    const degreeHeatingWeek = await getSofarHindcastData(
      SofarModels.NOAACoralReefWatch,
      sofarVariableIDs[SofarModels.NOAACoralReefWatch].degreeHeatingWeek,
      latitude,
      longitude,
      endOfDate,
      96,
    );

    // Check if there are any data returned
    // Grab the last one and convert it to degreeHeatingDays
    const latestDegreeHeatingWeek = getLatestData(degreeHeatingWeek);
    return (
      latestDegreeHeatingWeek && {
        value: latestDegreeHeatingWeek.value * 7,
        timestamp: latestDegreeHeatingWeek.timestamp,
      }
    );
  }
}

export async function getDailyData(
  site: Site,
  endOfDate: Date,
  excludedDates: ExclusionDates[],
): Promise<SofarDailyData> {
  const { polygon, sensorId, maxMonthlyMean, nearestNOAALocation } = site;
  // TODO - Accept Polygon option
  const [longitude, latitude] = (polygon as Point).coordinates;
  const [NOAALongitude, NOAALatitude] = nearestNOAALocation
    ? (nearestNOAALocation as Point).coordinates
    : (polygon as Point).coordinates;
  const sofarToken = site.spotterApiToken || process.env.SOFAR_API_TOKEN;

  const [
    spotterRawData,
    degreeHeatingDays,
    satelliteTemperatureData,
    significantWaveHeightsRaw,
    waveMeanDirectionRaw,
    waveMeanPeriodRaw,
    windVelocity10MeterEastward,
    windVelocity10MeterNorthward,
  ] = await Promise.all([
    sensorId
      ? getSpotterData(sensorId, sofarToken, endOfDate)
      : DEFAULT_SPOTTER_DATA_VALUE,
    // Calculate Degree Heating Days
    // Calculating Degree Heating Days requires exactly 84 days of data.
    getDegreeHeatingDays(latitude, longitude, endOfDate, maxMonthlyMean),
    getSofarHindcastData(
      SofarModels.NOAACoralReefWatch,
      sofarVariableIDs[SofarModels.NOAACoralReefWatch]
        .analysedSeaSurfaceTemperature,
      NOAALatitude,
      NOAALongitude,
      endOfDate,
      96,
    ),
    getSofarHindcastData(
      SofarModels.Wave,
      sofarVariableIDs[SofarModels.Wave].significantWaveHeight,
      latitude,
      longitude,
      endOfDate,
    ).then((data) => data.map(({ value }) => value)),
    getSofarHindcastData(
      SofarModels.Wave,
      sofarVariableIDs[SofarModels.Wave].meanDirection,
      latitude,
      longitude,
      endOfDate,
    ).then((data) => data.map(({ value }) => value)),
    getSofarHindcastData(
      SofarModels.Wave,
      sofarVariableIDs[SofarModels.Wave].meanPeriod,
      latitude,
      longitude,
      endOfDate,
    ).then((data) => data.map(({ value }) => value)),
    getSofarHindcastData(
      SofarModels.Atmosphere,
      sofarVariableIDs[SofarModels.Atmosphere].windVelocity10MeterEastward,
      latitude,
      longitude,
      endOfDate,
    ).then((data) => data.map(({ value }) => value)),
    getSofarHindcastData(
      SofarModels.Atmosphere,
      sofarVariableIDs[SofarModels.Atmosphere].windVelocity10MeterNorthward,
      latitude,
      longitude,
      endOfDate,
    ).then((data) => data.map(({ value }) => value)),
  ]);

  const inputVal = spotterRawData || DEFAULT_SPOTTER_DATA_VALUE;
  const spotterData = mapValues(inputVal, (v) =>
    extractSofarValues(filterMetricDataByDate(excludedDates, v)),
  );

  const minBottomTemperature = getMin(spotterData.bottomTemperature);
  const maxBottomTemperature = getMax(spotterData.bottomTemperature);
  const avgBottomTemperature = getAverage(spotterData.bottomTemperature);
  const surfaceTemperature = getAverage(spotterData.surfaceTemperature);
  const topTemperature = getAverage(spotterData.topTemperature);

  // Get satelliteTemperature
  const latestSatelliteTemperature =
    satelliteTemperatureData && getLatestData(satelliteTemperatureData);
  const satelliteTemperature =
    latestSatelliteTemperature && latestSatelliteTemperature.value;

  // Get waves data if unavailable through a spotter
  const significantWaveHeights =
    spotterData.significantWaveHeight.length > 0
      ? spotterData.significantWaveHeight
      : significantWaveHeightsRaw;

  const minWaveHeight =
    significantWaveHeights && getMin(significantWaveHeights);
  const maxWaveHeight =
    significantWaveHeights && getMax(significantWaveHeights);
  const avgWaveHeight =
    significantWaveHeights && getAverage(significantWaveHeights);

  const meanDirectionWaves =
    spotterData.waveMeanDirection.length > 0
      ? spotterData.waveMeanDirection
      : waveMeanDirectionRaw;

  const waveMeanDirection =
    meanDirectionWaves && getAverage(meanDirectionWaves, true);

  const meanPeriodWaves =
    spotterData.waveMeanPeriod.length > 0
      ? spotterData.waveMeanPeriod
      : waveMeanPeriodRaw;

  const waveMeanPeriod = meanPeriodWaves && getAverage(meanPeriodWaves, true);

  // Make sure that windVelocity10MeterEastward and windVelocity10MeterNorthward have the same length.
  const modelWindCheck =
    windVelocity10MeterEastward.length === windVelocity10MeterNorthward.length;

  const windSpeedsRaw = modelWindCheck
    ? windVelocity10MeterEastward.map((eastValue, index) =>
        getWindSpeed(eastValue, windVelocity10MeterNorthward[index]),
      )
    : [];
  const windDirectionsRaw = modelWindCheck
    ? windVelocity10MeterEastward.map((eastValue, index) =>
        getWindDirection(eastValue, windVelocity10MeterNorthward[index]),
      )
    : [];

  // Get wind data if unavailable through a spotter
  const windSpeeds = isEmpty(spotterData.windSpeed)
    ? windSpeedsRaw
    : spotterData.windSpeed;
  const windDirections = isEmpty(spotterData.windDirection)
    ? windDirectionsRaw
    : spotterData.windDirection;

  const minWindSpeed = windSpeeds && getMin(windSpeeds);
  const maxWindSpeed = windSpeeds && getMax(windSpeeds);
  const avgWindSpeed = windSpeeds && getAverage(windSpeeds);

  const windDirection = windDirections && getAverage(windDirections, true);

  const dailyAlertLevel = calculateAlertLevel(
    maxMonthlyMean,
    satelliteTemperature,
    degreeHeatingDays?.value,
  );

  return {
    site: { id: site.id },
    date: endOfDate,
    dailyAlertLevel,
    minBottomTemperature,
    maxBottomTemperature,
    avgBottomTemperature,
    topTemperature,
    satelliteTemperature,
    degreeHeatingDays: degreeHeatingDays?.value,
    minWaveHeight,
    maxWaveHeight,
    avgWaveHeight,
    waveMeanDirection,
    waveMeanPeriod,
    minWindSpeed,
    maxWindSpeed,
    avgWindSpeed,
    windDirection,
    surfaceTemperature,
  };
}

function hasNoData(data: SofarDailyData) {
  return Object.values(omit(data, 'site', 'date')).every(isUndefined);
}

export async function getWeeklyAlertLevel(
  dailyDataRepository: Repository<DailyData>,
  date: Date,
  site: Site,
): Promise<number | undefined> {
  const pastWeek = new Date(date);
  pastWeek.setDate(pastWeek.getDate() - 6);
  const query = await dailyDataRepository
    .createQueryBuilder('dailyData')
    .select('MAX(dailyData.dailyAlertLevel)', 'weeklyAlertLevel')
    .andWhere('dailyData.date >= :pastWeek', { pastWeek })
    .andWhere('dailyData.date <= :date', { date })
    .andWhere('dailyData.site = :site', { site: site.id })
    .getRawOne();

  return isNumber(query.weeklyAlertLevel) ? query.weeklyAlertLevel : undefined;
}

export function getMaxAlert(
  dailyAlertLevel?: number,
  weeklyAlertLevel?: number,
) {
  return getMax([weeklyAlertLevel, dailyAlertLevel].filter(isNumber));
}

/* eslint-disable no-console */
export async function getSitesDailyData(
  dataSource: DataSource,
  endOfDate: Date,
  siteIds?: number[],
) {
  const siteRepository = dataSource.getRepository(Site);
  const dailyDataRepository = dataSource.getRepository(DailyData);
  const exclusionDatesRepository = dataSource.getRepository(ExclusionDates);
  const allSites = await siteRepository.find({
    ...(siteIds && siteIds.length > 0
      ? {
          where: {
            id: In(siteIds),
          },
        }
      : {}),
    select: getAllColumns(siteRepository),
  });
  const start = new Date();
  console.log(
    `Updating ${allSites.length} sites for ${endOfDate.toDateString()}.`,
  );
  await Bluebird.map(
    allSites,
    async (site) => {
      const excludedDates = await getExclusionDates(
        exclusionDatesRepository,
        site.sensorId,
      );

      const dailyDataInput = await getDailyData(site, endOfDate, excludedDates);

      // If no data returned from the update function, skip
      if (hasNoData(dailyDataInput)) {
        console.log('No data has been fetched. Skipping...');
        return;
      }

      // Calculate weekly alert level
      const weeklyAlertLevel = await getWeeklyAlertLevel(
        dailyDataRepository,
        endOfDate,
        site,
      );

      const entity = dailyDataRepository.create({
        ...dailyDataInput,
        weeklyAlertLevel: getMaxAlert(
          dailyDataInput.dailyAlertLevel,
          weeklyAlertLevel,
        ),
      });
      try {
        // Try to save daily data entity
        await dailyDataRepository.save(entity);
      } catch (err) {
        // Update instead of insert
        if (get(err, 'constraint') === 'no_duplicated_date') {
          const filteredData = omitBy(entity, isNil);
          await dailyDataRepository
            .createQueryBuilder('dailyData')
            .update()
            .where('site_id = :site_id', { site_id: site.id })
            .andWhere('Date(date) = Date(:date)', { date: entity.date })
            .set(filteredData)
            .execute();
        } else {
          console.error(
            `Error updating data for Site ${
              site.id
            } & ${endOfDate.toDateString()}: ${err}.`,
          );
        }
      }
    },
    { concurrency: 8 },
  );
  console.log(
    `Updated ${allSites.length} sites in ${
      (new Date().valueOf() - start.valueOf()) / 1000
    } seconds`,
  );
}

export async function runDailyUpdate(dataSource: DataSource) {
  const today = DateTime.utc().endOf('day');

  const yesterday = today.set({ day: today.day - 1 });
  console.log(`Daily Update for data ending on ${yesterday.day}`);
  try {
    await getSitesDailyData(dataSource, yesterday.toJSDate());
    console.log('Completed daily update.');
  } catch (error) {
    console.error(error);
  }
}
