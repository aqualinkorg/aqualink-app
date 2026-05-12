import _, { camelCase } from 'lodash';
import { Repository } from 'typeorm';
import { DynamicCollection } from '../collections/collections.entity';
import { CollectionDataDto } from '../collections/dto/collection-data.dto';
import { Site } from '../sites/sites.entity';
import { DailyData } from '../sites/daily-data.entity';
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

export const getCollectionDataForDate = async (
  sites: Site[],
  dailyDataRepository: Repository<DailyData>,
  startDate: Date,
  endDate: Date,
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
    .addSelect('daily_data.daily_alert_level', 'dailyAlertLevel')
    .addSelect('daily_data.weekly_alert_level', 'weeklyAlertLevel')
    .where('daily_data.site_id IN (:...siteIds)', { siteIds })
    .andWhere('daily_data.date >= :startDate', { startDate })
    .andWhere('daily_data.date <= :endDate', { endDate })
    .getRawMany();

  return dailyData.reduce<Record<number, CollectionDataDto>>((acc, data) => {
    const collectionData = _.omitBy(
      {
        satelliteTemperature: data.satelliteTemperature,
        dhw: data.degreeHeatingDays,
        tempAlert: data.dailyAlertLevel,
        tempWeeklyAlert: data.weeklyAlertLevel,
      },
      _.isNil,
    );

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
