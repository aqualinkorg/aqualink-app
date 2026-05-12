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

export const getHistoricalCollectionData = async (
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
    .select('daily_data.id', 'id')
    .addSelect('daily_data.date', 'date')
    .addSelect('daily_data.satellite_temperature', 'satelliteTemperature')
    .addSelect('daily_data.degree_heating_days', 'degreeHeatingDays')
    .addSelect('daily_data.daily_alert_level', 'dailyAlertLevel')
    .addSelect('daily_data.weekly_alert_level', 'weeklyAlertLevel')
    .addSelect('site_id', 'siteId')
    .where('site_id IN (:...siteIds)', { siteIds })
    .andWhere('daily_data.date <= :date', { date })
    .andWhere(
      'daily_data.date >= :minDate',
      // Look back up to 7 days to find the closest data
      {
        minDate: new Date(
          new Date(date).getTime() - 7 * 24 * 60 * 60 * 1000,
        )
          .toISOString()
          .split('T')[0],
      },
    )
    .orderBy('daily_data.date', 'DESC')
    .getRawMany();

  // Group by site and take the most recent row per site
  return _(dailyData)
    .groupBy((o) => o.siteId)
    .mapValues<CollectionDataDto>((data) => {
      const latest = data[0]; // Already sorted DESC by date
      return {
        satelliteTemperature: latest.satelliteTemperature,
        dhw: latest.degreeHeatingDays,
        tempAlert: latest.dailyAlertLevel,
        tempWeeklyAlert: latest.weeklyAlertLevel,
      };
    })
    .toJSON();
};

export const heatStressTracker: DynamicCollection = {
  name: 'Heat Stress Tracker',
  sites: [],
  siteIds: [],
  isPublic: true,
};
