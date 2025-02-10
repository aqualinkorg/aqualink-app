/** Worker to process daily data for all sites. */
import { get, isNil, isNumber, isUndefined, omit, omitBy } from 'lodash';
import { DataSource, In, Repository } from 'typeorm';
import { Point } from 'geojson';
import Bluebird from 'bluebird';
import { DateTime } from 'luxon';
import { Logger } from '@nestjs/common';
import { Site } from '../sites/sites.entity';
import { DailyData } from '../sites/daily-data.entity';
import { getMax } from '../utils/math';
import { getLatestData, getSofarHindcastData } from '../utils/sofar';
import { calculateDegreeHeatingDays } from '../utils/temperature';
import { SofarDailyData, ValueWithTimestamp } from '../utils/sofar.types';
import { SofarModels, sofarVariableIDs } from '../utils/constants';
import { calculateAlertLevel } from '../utils/bleachingAlert';
import { getAllColumns } from '../utils/site.utils';

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
): Promise<SofarDailyData> {
  const { polygon, maxMonthlyMean, nearestNOAALocation } = site;
  const [NOAALongitude, NOAALatitude] = nearestNOAALocation
    ? (nearestNOAALocation as Point).coordinates
    : (polygon as Point).coordinates;

  const [degreeHeatingDays, satelliteTemperatureData] = await Promise.all([
    // Calculate Degree Heating Days
    // Calculating Degree Heating Days requires exactly 84 days of data.
    getDegreeHeatingDays(
      NOAALatitude,
      NOAALongitude,
      endOfDate,
      maxMonthlyMean,
    ),
    getSofarHindcastData(
      SofarModels.NOAACoralReefWatch,
      sofarVariableIDs[SofarModels.NOAACoralReefWatch]
        .analysedSeaSurfaceTemperature,
      NOAALatitude,
      NOAALongitude,
      endOfDate,
      96,
    ),
  ]);

  // Get satelliteTemperature
  const latestSatelliteTemperature =
    satelliteTemperatureData && getLatestData(satelliteTemperatureData);
  const satelliteTemperature =
    latestSatelliteTemperature && latestSatelliteTemperature.value;

  const dailyAlertLevel = calculateAlertLevel(
    maxMonthlyMean,
    satelliteTemperature,
    degreeHeatingDays?.value,
  );

  return {
    site: { id: site.id },
    date: endOfDate,
    dailyAlertLevel,
    satelliteTemperature,
    degreeHeatingDays: degreeHeatingDays?.value,
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

export async function getSitesIdsWithoutDataForDate(
  dataSource: DataSource,
  date: Date,
  siteIds?: number[],
): Promise<number[]> {
  const query = dataSource
    .getRepository(Site)
    .createQueryBuilder('s')
    .select('s.id', 'id')
    .where(
      `NOT EXISTS (
        SELECT 1
        FROM daily_data dd
        WHERE dd.site_id = s.id
        AND dd.date = :date
      )`,
      { date },
    );

  if (siteIds?.length) {
    query.andWhere('s.id IN (:...siteIds)', { siteIds });
  }

  return (await query.getRawMany<{ id: number }>()).map((site) => site.id);
}

/* eslint-disable no-console */
export async function getSitesDailyData(
  dataSource: DataSource,
  endOfDate: Date,
  siteIds?: number[],
) {
  const siteRepository = dataSource.getRepository(Site);
  const dailyDataRepository = dataSource.getRepository(DailyData);
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
  Logger.log(
    `Updating ${allSites.length} sites for ${endOfDate.toDateString()}.`,
  );
  await Bluebird.map(
    allSites,
    async (site) => {
      const dailyDataInput = await getDailyData(site, endOfDate);

      // If no data returned from the update function, skip
      if (hasNoData(dailyDataInput)) {
        Logger.log(`No data has been fetched. Skipping ${site.id}...`);
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
  Logger.log(
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
