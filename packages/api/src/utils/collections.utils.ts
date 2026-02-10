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
  dailyDataRepository?: Repository<DailyData>,
  options?: { at?: Date },
): Promise<Record<number, CollectionDataDto>> => {
  const siteIds = sites.map((site) => site.id);

  if (!siteIds.length) {
    return {};
  }

  // If a specific date is requested and we have access to dailyDataRepository, use daily_data
  if (options?.at && dailyDataRepository) {
    const dailyData = await dailyDataRepository
      .createQueryBuilder('daily_data')
      .select('daily_data.id', 'id')
      .addSelect('daily_data.date', 'date')
      .addSelect('daily_data.satelliteTemperature', 'satelliteTemperature')
      .addSelect('daily_data.degreeHeatingDays', 'degreeHeatingDays')
      .addSelect('daily_data.dailyAlertLevel', 'dailyAlertLevel')
      .addSelect('daily_data.weeklyAlertLevel', 'weeklyAlertLevel')
      .addSelect('site.id', 'siteId')
      .innerJoin('daily_data.site', 'site')
      .where('site.id IN (:...siteIds)', { siteIds })
      .andWhere('daily_data.date = :targetDate', { targetDate: options.at })
      .getRawMany();

    return _(dailyData)
      .groupBy((o) => o.siteId)
      .mapValues<CollectionDataDto>((data) => {
        const item = data[0]; // Should only be one per site per date
        return {
          satelliteTemperature: item.satelliteTemperature,
          dhw: item.degreeHeatingDays,
          tempAlert: item.dailyAlertLevel,
          tempWeeklyAlert: item.weeklyAlertLevel,
        };
      })
      .toJSON();
  }

  // Default behavior: Get latest data
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

export const heatStressTracker: DynamicCollection = {
  name: 'Heat Stress Tracker',
  sites: [],
  siteIds: [],
  isPublic: true,
};
