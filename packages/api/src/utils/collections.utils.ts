import _, { camelCase } from 'lodash';
import { Repository } from 'typeorm';
import { DynamicCollection } from '../collections/collections.entity';
import { CollectionDataDto } from '../collections/dto/collection-data.dto';
import { DailyData } from '../sites/daily-data.entity';
import { Site } from '../sites/sites.entity';
import { SourceType } from '../sites/schemas/source-type.enum';
import { LatestData } from '../time-series/latest-data.entity';

type HistoricalCollectionData = {
  siteId: number;
  satelliteTemperature: number | null;
  degreeHeatingDays: number | null;
  dailyAlertLevel: number | null;
  weeklyAlertLevel: number | null;
};

const parseNullableNumber = (
  value: number | string | null,
): number | undefined => (value === null ? undefined : Number(value));

const getHistoricalCollectionData = async (
  siteIds: number[],
  dailyDataRepository: Repository<DailyData>,
  date: Date,
): Promise<Record<number, CollectionDataDto>> => {
  const dailyData = await dailyDataRepository
    .createQueryBuilder('daily_data')
    .select('DISTINCT ON (daily_data.site_id) daily_data.site_id', 'siteId')
    .addSelect('daily_data.satellite_temperature', 'satelliteTemperature')
    .addSelect('daily_data.degree_heating_days', 'degreeHeatingDays')
    .addSelect('daily_data.daily_alert_level', 'dailyAlertLevel')
    .addSelect('daily_data.weekly_alert_level', 'weeklyAlertLevel')
    .where('daily_data.site_id IN (:...siteIds)', { siteIds })
    .andWhere('daily_data.date <= :date', { date })
    .orderBy('daily_data.site_id', 'ASC')
    .addOrderBy('daily_data.date', 'DESC')
    .getRawMany<HistoricalCollectionData>();

  return dailyData.reduce<Record<number, CollectionDataDto>>((acc, data) => {
    const degreeHeatingDays = parseNullableNumber(data.degreeHeatingDays);
    return {
      ...acc,
      [data.siteId]: {
        satelliteTemperature: parseNullableNumber(data.satelliteTemperature),
        dhw:
          degreeHeatingDays === undefined ? undefined : degreeHeatingDays / 7,
        tempAlert: parseNullableNumber(data.dailyAlertLevel),
        tempWeeklyAlert:
          parseNullableNumber(data.weeklyAlertLevel) ??
          parseNullableNumber(data.dailyAlertLevel),
      },
    };
  }, {});
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

  if (date && dailyDataRepository) {
    return getHistoricalCollectionData(siteIds, dailyDataRepository, date);
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
