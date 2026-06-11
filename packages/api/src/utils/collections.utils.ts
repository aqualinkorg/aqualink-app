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

/**
 * Fetch per-site collection data for a specific historical date from DailyData.
 * Maps DailyData fields to the CollectionDataDto keys used by the frontend.
 */
export const getHistoricalCollectionData = async (
  sites: Site[],
  dailyDataRepository: Repository<DailyData>,
  date: string,
): Promise<Record<number, CollectionDataDto>> => {
  const siteIds = sites.map((site) => site.id);

  if (!siteIds.length) {
    return {};
  }

  const targetDate = new Date(date);
  // Round to day boundary to match DailyData.date column (stored as midnight UTC)
  targetDate.setUTCHours(0, 0, 0, 0);

  const rows = await dailyDataRepository
    .createQueryBuilder('daily_data')
    .select('daily_data.site_id', 'siteId')
    .addSelect('daily_data.weekly_alert_level', 'weeklyAlertLevel')
    .addSelect('daily_data.daily_alert_level', 'dailyAlertLevel')
    .addSelect('daily_data.satellite_temperature', 'satelliteTemperature')
    .addSelect('daily_data.degree_heating_days', 'degreeHeatingDays')
    .where('daily_data.site_id IN (:...siteIds)', { siteIds })
    .andWhere('DATE(daily_data.date) = DATE(:targetDate)', { targetDate })
    .getRawMany<{
      siteId: number;
      weeklyAlertLevel: number | null;
      dailyAlertLevel: number | null;
      satelliteTemperature: number | null;
      degreeHeatingDays: number | null;
    }>();

  return Object.fromEntries(
    rows.map((row) => [
      row.siteId,
      {
        tempWeeklyAlert: row.weeklyAlertLevel ?? undefined,
        tempAlert: row.dailyAlertLevel ?? undefined,
        satelliteTemperature: row.satelliteTemperature ?? undefined,
        dhw: row.degreeHeatingDays ?? undefined,
      } as CollectionDataDto,
    ]),
  );
};

export const heatStressTracker: DynamicCollection = {
  name: 'Heat Stress Tracker',
  sites: [],
  siteIds: [],
  isPublic: true,
};
