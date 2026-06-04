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

export const getCollectionDataAtDate = async (
  sites: Site[],
  dailyDataRepository: Repository<DailyData>,
  date: string,
): Promise<Record<number, CollectionDataDto>> => {
  const siteIds = sites.map((site) => site.id);

  if (!siteIds.length) {
    return {};
  }

  const dailyData = await dailyDataRepository
    .createQueryBuilder('daily_data')
    .select('daily_data.site_id', 'siteId')
    .addSelect('daily_data.satellite_temperature', 'satelliteTemperature')
    .addSelect('daily_data.degree_heating_days', 'degreeHeatingDays')
    .addSelect('daily_data.weekly_alert_level', 'weeklyAlertLevel')
    .where('daily_data.site_id IN (:...siteIds)', { siteIds })
    .andWhere('DATE(daily_data.date) = DATE(:date)', { date })
    .getRawMany<{
      siteId: number;
      satelliteTemperature: number | null;
      degreeHeatingDays: number | null;
      weeklyAlertLevel: number | null;
    }>();

  return dailyData.reduce<Record<number, CollectionDataDto>>(
    (acc, data) => ({
      ...acc,
      [data.siteId]: {
        ...(data.satelliteTemperature !== null && {
          satelliteTemperature: data.satelliteTemperature,
        }),
        ...(data.degreeHeatingDays !== null && {
          dhw: data.degreeHeatingDays,
        }),
        ...(data.weeklyAlertLevel !== null && {
          tempWeeklyAlert: data.weeklyAlertLevel,
        }),
      },
    }),
    {},
  );
};

export const heatStressTracker: DynamicCollection = {
  name: 'Heat Stress Tracker',
  sites: [],
  siteIds: [],
  isPublic: true,
};
