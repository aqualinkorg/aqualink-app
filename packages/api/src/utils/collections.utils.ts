import _, { camelCase } from 'lodash';
import { Repository } from 'typeorm';
import { DynamicCollection } from '../collections/collections.entity';
import { CollectionDataDto } from '../collections/dto/collection-data.dto';
import { Site } from '../sites/sites.entity';
import { SourceType } from '../sites/schemas/source-type.enum';
import { DailyData } from '../sites/daily-data.entity';
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

  // When a historical date is specified, query daily_data instead of latest_data
  if (date && dailyDataRepository) {
    const rows = await dailyDataRepository
      .createQueryBuilder('daily')
      .select('daily.site_id', 'siteId')
      .addSelect('daily.satellite_temperature', 'satelliteTemperature')
      .addSelect('daily.degree_heating_days', 'degreeHeatingDays')
      .addSelect('daily.daily_alert_level', 'dailyAlertLevel')
      .addSelect('daily.weekly_alert_level', 'weeklyAlertLevel')
      .addSelect('daily.date', 'date')
      .where('daily.site_id IN (:...siteIds)', { siteIds })
      .andWhere('daily.date <= :date', { date })
      .andWhere('daily.satellite_temperature IS NOT NULL')
      .getRawMany();

    // Keep only the latest daily row per site
    const latestById = _(rows)
      .groupBy((o) => o.siteId)
      .mapValues((rows) => rows.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0])
      .toJSON();

    return _(latestById)
      .mapValues<CollectionDataDto>((data) => ({
        satelliteTemperature: data.satelliteTemperature,
        degreeHeatingDays: data.degreeHeatingDays,
        dailyAlertLevel: data.dailyAlertLevel,
        weeklyAlertLevel: data.weeklyAlertLevel,
      }))
      .toJSON();
  }

  // Default: get latest data
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
