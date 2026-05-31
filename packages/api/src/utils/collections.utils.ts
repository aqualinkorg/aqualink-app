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
  dailyDataRepository?: Repository<DailyData>,
  date?: string,
): Promise<Record<number, CollectionDataDto>> => {
  const siteIds = sites.map((site) => site.id);

  if (!siteIds.length) {
    return {};
  }

  if (date && dailyDataRepository) {
    const start = new Date(`${date}T00:00:00.000Z`);
    const end = new Date(`${date}T23:59:59.999Z`);

    const dailyData = await dailyDataRepository
      .createQueryBuilder('daily_data')
      .select('daily_data.site_id', 'siteId')
      .addSelect('daily_data.satellite_temperature', 'satelliteTemperature')
      .addSelect('daily_data.daily_alert_level', 'tempAlert')
      .addSelect('daily_data.weekly_alert_level', 'tempWeeklyAlert')
      .where('daily_data.site_id IN (:...siteIds)', { siteIds })
      .andWhere('daily_data.date BETWEEN :start AND :end', { start, end })
      .getRawMany();

    return _(dailyData)
      .keyBy((data) => data.siteId)
      .mapValues<CollectionDataDto>((data) => ({
        satelliteTemperature: data.satelliteTemperature,
        tempAlert: data.tempAlert,
        tempWeeklyAlert: data.tempWeeklyAlert,
      }))
      .toJSON();
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

export const heatStressTracker: DynamicCollection = {
  name: 'Heat Stress Tracker',
  sites: [],
  siteIds: [],
  isPublic: true,
};
