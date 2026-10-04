import _, { camelCase } from 'lodash';
import { Repository } from 'typeorm';
import { DynamicCollection } from '../collections/collections.entity';
import { CollectionDataDto } from '../collections/dto/collection-data.dto';
import { DailyData } from '../sites/daily-data.entity';
import { Site } from '../sites/sites.entity';
import { SourceType } from '../sites/schemas/source-type.enum';
import { LatestData } from '../time-series/latest-data.entity';

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

export const getCollectionDataAsOf = async (
  sites: Site[],
  dailyDataRepository: Repository<DailyData>,
  date: string,
): Promise<Record<number, CollectionDataDto>> => {
  const siteIds = sites.map((site) => site.id);

  if (!siteIds.length) {
    return {};
  }

  // Get the most recent daily_data row on or before `date` for each site.
  // daily_data is unique per (site, date), so DISTINCT ON (site_id) with a
  // descending date order yields exactly one row per site.
  const rows = await dailyDataRepository
    .createQueryBuilder('daily_data')
    .distinctOn(['daily_data.site_id'])
    .addSelect('daily_data.site_id', 'siteId')
    .addSelect('daily_data.satelliteTemperature', 'satelliteTemperature')
    .addSelect('daily_data.weeklyAlertLevel', 'weeklyAlertLevel')
    .addSelect('daily_data.dailyAlertLevel', 'dailyAlertLevel')
    .where('site_id IN (:...siteIds)', { siteIds })
    .andWhere('date <= :asOfDate', { asOfDate: date })
    .orderBy('daily_data.site_id', 'ASC')
    .addOrderBy('daily_data.date', 'DESC')
    .getRawMany<{
      siteId: number;
      satelliteTemperature: number | null;
      weeklyAlertLevel: number | null;
      dailyAlertLevel: number | null;
    }>();

  return rows.reduce<Record<number, CollectionDataDto>>((acc, row) => {
    acc[row.siteId] = {
      ...(row.satelliteTemperature !== null &&
      row.satelliteTemperature !== undefined
        ? { satelliteTemperature: row.satelliteTemperature }
        : {}),
      ...(row.weeklyAlertLevel !== null && row.weeklyAlertLevel !== undefined
        ? { tempWeeklyAlert: row.weeklyAlertLevel }
        : {}),
      ...(row.dailyAlertLevel !== null && row.dailyAlertLevel !== undefined
        ? { tempAlert: row.dailyAlertLevel }
        : {}),
    };
    return acc;
  }, {});
};

export const heatStressTracker: DynamicCollection = {
  name: 'Heat Stress Tracker',
  sites: [],
  siteIds: [],
  isPublic: true,
};
