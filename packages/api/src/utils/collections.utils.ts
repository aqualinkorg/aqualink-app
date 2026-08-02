import _, { camelCase } from 'lodash';
import { Repository } from 'typeorm';
import { DynamicCollection } from '../collections/collections.entity';
import { CollectionDataDto } from '../collections/dto/collection-data.dto';
import { Site } from '../sites/sites.entity';
import { SourceType } from '../sites/schemas/source-type.enum';
import { LatestData } from '../time-series/latest-data.entity';
import { DailyData } from '../sites/daily-data.entity';

export const getCollectionData = async (
  sites: Site[],
  latestDataRepository: Repository<LatestData>,
): Promise<Record<number, CollectionDataDto>> => {
  const siteIds = sites.map((site) => site.id);

  if (!siteIds.length) {
    return {};
  }

  // Get latest data
  const latestData: LatestData[] = await latestDataRepository
    .createQueryBuilder('latest_data')
    .select('id')
    .addSelect('timestamp')
    .addSelect('value')
    .addSelect('site_id', 'siteId')
    .addSelect('survey_point_id', 'surveyPointId')
    .addSelect('metric')
    .addSelect('source')
    .where('site_id IN (:...siteIds)', { siteIds })
    .andWhere('source != :hoboSource', { hoboSource: SourceType.HOBO })
    .getRawMany();

  // Map data to each site and map each site's data to the CollectionDataDto
  return _(latestData)
    .groupBy((o) => o.siteId)
    .mapValues<CollectionDataDto>((data) =>
      data.reduce<CollectionDataDto>(
        (acc, siteData): CollectionDataDto => ({
          ...acc,
          [camelCase(siteData.metric)]: siteData.value,
        }),
        {},
      ),
    )
    .toJSON();
};

/**
 * Build the map summary from the latest daily snapshot at or before a date.
 * Daily data is the historical source of truth for the map's heat-stress
 * indicators; latest_data only represents the current snapshot.
 */
export const getHistoricalCollectionData = async (
  sites: Site[],
  dailyDataRepository: Repository<DailyData>,
  date: Date,
): Promise<Record<number, CollectionDataDto>> => {
  const siteIds = sites.map((site) => site.id);

  if (!siteIds.length) {
    return {};
  }

  const dailyData = await dailyDataRepository
    .createQueryBuilder('daily_data')
    .select('daily_data.site_id', 'siteId')
    .addSelect('daily_data.degree_heating_days', 'degreeHeatingDays')
    .addSelect('daily_data.satellite_temperature', 'satelliteTemperature')
    .addSelect('daily_data.daily_alert_level', 'dailyAlertLevel')
    .addSelect('daily_data.weekly_alert_level', 'weeklyAlertLevel')
    .where('daily_data.site_id IN (:...siteIds)', { siteIds })
    .andWhere('daily_data.date <= :date', { date })
    .orderBy('daily_data.date', 'DESC')
    .getRawMany<{
      siteId: number;
      degreeHeatingDays: number | null;
      satelliteTemperature: number | null;
      dailyAlertLevel: number | null;
      weeklyAlertLevel: number | null;
    }>();

  const snapshots = new Map<number, (typeof dailyData)[number]>();
  dailyData.forEach((row) => {
    if (!snapshots.has(Number(row.siteId))) {
      snapshots.set(Number(row.siteId), row);
    }
  });

  return Array.from(snapshots.entries()).reduce<Record<number, CollectionDataDto>>(
    (result, [siteId, row]) => {
      result[siteId] = {
        ...(row.degreeHeatingDays == null
          ? {}
          : { dhw: row.degreeHeatingDays / 7 }),
        ...(row.satelliteTemperature == null
          ? {}
          : { satelliteTemperature: row.satelliteTemperature }),
        ...(row.dailyAlertLevel == null
          ? {}
          : { tempAlert: row.dailyAlertLevel }),
        ...(row.weeklyAlertLevel == null
          ? {}
          : { tempWeeklyAlert: row.weeklyAlertLevel }),
      };
      return result;
    },
    {},
  );
};

export const heatStressTracker: DynamicCollection = {
  name: 'Heat Stress Tracker',
  sites: [],
  siteIds: [],
  isPublic: true,
};
