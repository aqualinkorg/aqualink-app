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

export const getDailyCollectionData = async (
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
    .addSelect('daily_data.satelliteTemperature', 'satelliteTemperature')
    .addSelect('daily_data.degreeHeatingDays', 'degreeHeatingDays')
    .addSelect('daily_data.dailyAlertLevel', 'dailyAlertLevel')
    .addSelect('daily_data.weeklyAlertLevel', 'weeklyAlertLevel')
    .where('daily_data.site_id IN (:...siteIds)', { siteIds })
    .andWhere('daily_data.date <= :date', { date })
    .distinctOn(['daily_data.site_id'])
    .orderBy('daily_data.site_id', 'ASC')
    .addOrderBy('daily_data.date', 'DESC')
    .getRawMany<{
      siteId: number;
      satelliteTemperature: number | null;
      degreeHeatingDays: number | null;
      dailyAlertLevel: number | null;
      weeklyAlertLevel: number | null;
    }>();

  return dailyData.reduce<Record<number, CollectionDataDto>>((acc, data) => {
    const tempWeeklyAlert =
      data.weeklyAlertLevel !== null
        ? data.weeklyAlertLevel
        : data.dailyAlertLevel;
    const collectionData: CollectionDataDto = {
      ...(data.satelliteTemperature !== null && {
        satelliteTemperature: data.satelliteTemperature,
      }),
      ...(data.degreeHeatingDays !== null && {
        dhw: data.degreeHeatingDays / 7,
      }),
      ...(data.dailyAlertLevel !== null && {
        tempAlert: data.dailyAlertLevel,
      }),
      ...(tempWeeklyAlert !== null && { tempWeeklyAlert }),
    };

    return {
      ...acc,
      [data.siteId]: collectionData,
    };
  }, {});
};

export const heatStressTracker: DynamicCollection = {
  name: 'Heat Stress Tracker',
  sites: [],
  siteIds: [],
  isPublic: true,
};
