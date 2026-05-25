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
  dailyDataRepository: Repository<DailyData>,
  date?: string,
): Promise<Record<number, CollectionDataDto>> => {
  const siteIds = sites.map((site) => site.id);

  if (!siteIds.length) {
    return {};
  }

  const collectionRows = date
    ? await dailyDataRepository
        .createQueryBuilder('daily_data')
        .select('daily_data.id', 'id')
        .addSelect('daily_data.date', 'date')
        .addSelect('daily_data.degreeHeatingDays', 'degreeHeatingDays')
        .addSelect('daily_data.satelliteTemperature', 'satelliteTemperature')
        .addSelect('daily_data.dailyAlertLevel', 'dailyAlertLevel')
        .addSelect('daily_data.weeklyAlertLevel', 'weeklyAlertLevel')
        .addSelect('daily_data.site_id', 'siteId')
        .where('daily_data.site_id IN (:...siteIds)', { siteIds })
        .andWhere('daily_data.date <= :date', { date })
        .distinctOn(['daily_data.site_id'])
        .orderBy('daily_data.site_id', 'ASC')
        .addOrderBy('daily_data.date', 'DESC')
        .getRawMany()
    : await latestDataRepository
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
  return _(collectionRows)
    .groupBy((o) => o.siteId)
    .mapValues<CollectionDataDto>((data) =>
      data.reduce<CollectionDataDto>((acc, siteData): CollectionDataDto => {
        if (!date) {
          return {
            ...acc,
            [camelCase(siteData.metric)]: siteData.value,
          };
        }

        return {
          ...acc,
          ...(siteData.degreeHeatingDays !== undefined
            ? { dhw: siteData.degreeHeatingDays }
            : {}),
          ...(siteData.satelliteTemperature !== undefined
            ? { satelliteTemperature: siteData.satelliteTemperature }
            : {}),
          ...(siteData.dailyAlertLevel !== undefined
            ? { tempAlert: siteData.dailyAlertLevel }
            : {}),
          ...(siteData.weeklyAlertLevel !== undefined
            ? { tempWeeklyAlert: siteData.weeklyAlertLevel }
            : {}),
        };
      }, {}),
    )
    .toJSON();
};

export const heatStressTracker: DynamicCollection = {
  name: 'Heat Stress Tracker',
  sites: [],
  siteIds: [],
  isPublic: true,
};
