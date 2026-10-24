import _, { camelCase } from 'lodash';
import { Repository } from 'typeorm';
import { DynamicCollection } from '../collections/collections.entity';
import { CollectionDataDto } from '../collections/dto/collection-data.dto';
import { Site } from '../sites/sites.entity';
import { SourceType } from '../sites/schemas/source-type.enum';
import { LatestData } from '../time-series/latest-data.entity';
import { DailyData } from '../sites/daily-data.entity';
import { getHistoricalSince } from './historical-date.utils';

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

interface HistoricalDailyDataRow {
  siteId: number;
  date: Date;
  satelliteTemperature: number | null;
  degreeHeatingDays: number | null;
  dailyAlertLevel: number | null;
  weeklyAlertLevel: number | null;
}

/**
 * Builds the same per-site CollectionDataDto as `getCollectionData`, but
 * from the `daily_data` table as of `until` (inclusive) instead of the
 * `latest_data` view. For each site, the most recent daily data entry in
 * [since, until] is used. Sites with no daily data in that window get no
 * collection data, so stale values are never shown as the historical state.
 */
export const getHistoricalCollectionData = async (
  sites: Site[],
  dailyDataRepository: Repository<DailyData>,
  until: Date,
  since: Date = getHistoricalSince(until),
): Promise<Record<number, CollectionDataDto>> => {
  const siteIds = sites.map((site) => site.id);

  if (!siteIds.length) {
    return {};
  }

  const rows: HistoricalDailyDataRow[] = await dailyDataRepository
    .createQueryBuilder('daily_data')
    .distinctOn(['daily_data.site_id'])
    .select('daily_data.site_id', 'siteId')
    .addSelect('daily_data.date', 'date')
    .addSelect('daily_data.satellite_temperature', 'satelliteTemperature')
    .addSelect('daily_data.degree_heating_days', 'degreeHeatingDays')
    .addSelect('daily_data.daily_alert_level', 'dailyAlertLevel')
    .addSelect('daily_data.weekly_alert_level', 'weeklyAlertLevel')
    .where('daily_data.site_id IN (:...siteIds)', { siteIds })
    .andWhere('daily_data.date <= :until', { until })
    .andWhere('daily_data.date >= :since', { since })
    .orderBy('daily_data.site_id')
    .addOrderBy('daily_data.date', 'DESC')
    .getRawMany();

  return rows.reduce<Record<number, CollectionDataDto>>((acc, row) => {
    const data = _.omitBy(
      {
        satelliteTemperature: row.satelliteTemperature,
        // daily_data stores degree heating days, the API exposes DHW (weeks)
        dhw: _.isNil(row.degreeHeatingDays)
          ? undefined
          : row.degreeHeatingDays / 7,
        tempAlert: row.dailyAlertLevel,
        tempWeeklyAlert: row.weeklyAlertLevel,
      },
      _.isNil,
    ) as CollectionDataDto;
    return {
      ...acc,
      [row.siteId]: { ...data, historicalDate: new Date(row.date) },
    };
  }, {});
};

export const heatStressTracker: DynamicCollection = {
  name: 'Heat Stress Tracker',
  sites: [],
  siteIds: [],
  isPublic: true,
};
