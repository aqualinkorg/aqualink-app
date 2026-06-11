import _, { camelCase } from 'lodash';
import { Repository } from 'typeorm';
import { DynamicCollection } from '../collections/collections.entity';
import { CollectionDataDto } from '../collections/dto/collection-data.dto';
import { DailyData } from '../sites/daily-data.entity';
import { Site } from '../sites/sites.entity';
import { SourceType } from '../sites/schemas/source-type.enum';
import { LatestData } from '../time-series/latest-data.entity';

type DailyCollectionDataRow = {
  siteId: number;
  degreeHeatingDays: number | null;
  satelliteTemperature: number | null;
  dailyAlertLevel: number | null;
  weeklyAlertLevel: number | null;
};

const getDailyCollectionData = async (
  siteIds: number[],
  dailyDataRepository: Repository<DailyData>,
  date: Date,
): Promise<Record<number, CollectionDataDto>> => {
  const dailyData: DailyCollectionDataRow[] = await dailyDataRepository
    .createQueryBuilder('daily_data')
    .select('daily_data.site_id', 'siteId')
    .addSelect('daily_data.degree_heating_days', 'degreeHeatingDays')
    .addSelect('daily_data.satellite_temperature', 'satelliteTemperature')
    .addSelect('daily_data.daily_alert_level', 'dailyAlertLevel')
    .addSelect('daily_data.weekly_alert_level', 'weeklyAlertLevel')
    .where('daily_data.site_id IN (:...siteIds)', { siteIds })
    .andWhere('daily_data.date <= :date', { date })
    .orderBy('daily_data.site_id', 'ASC')
    .addOrderBy('daily_data.date', 'DESC')
    .getRawMany();

  return _(dailyData)
    .groupBy((row) => row.siteId)
    .mapValues<CollectionDataDto>((rows) => {
      const latestDailyData = rows[0];

      return {
        dhw: latestDailyData.degreeHeatingDays ?? undefined,
        satelliteTemperature: latestDailyData.satelliteTemperature ?? undefined,
        tempAlert: latestDailyData.dailyAlertLevel ?? undefined,
        tempWeeklyAlert: latestDailyData.weeklyAlertLevel ?? undefined,
      };
    })
    .toJSON();
};

export const getCollectionData = async (
  sites: Site[],
  latestDataRepository: Repository<LatestData>,
  dailyDataRepository?: Repository<DailyData>,
  date?: Date,
): Promise<Record<number, CollectionDataDto>> => {
  const siteIds = sites.map((site) => site.id);

  if (!siteIds.length) {
    return {};
  }

  if (dailyDataRepository && date) {
    return getDailyCollectionData(siteIds, dailyDataRepository, date);
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
