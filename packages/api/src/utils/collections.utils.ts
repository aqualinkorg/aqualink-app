import _, { camelCase, isNil, omitBy } from 'lodash';
import { Repository } from 'typeorm';
import { DynamicCollection } from '../collections/collections.entity';
import { CollectionDataDto } from '../collections/dto/collection-data.dto';
import { Site } from '../sites/sites.entity';
import { SourceType } from '../sites/schemas/source-type.enum';
import { LatestData } from '../time-series/latest-data.entity';
import { DailyData } from '../sites/daily-data.entity';
import { DateTime } from '../luxon-extensions';

// How far back we look for a daily_data row when the requested day itself has no data.
// Keeps a gap of a day or two from showing up as "no data", without presenting values
// that are weeks old as if they were current for the selected date.
export const HISTORICAL_LOOKBACK_DAYS = 7;

interface DailyDataRow {
  siteId: number;
  satelliteTemperature: number | null;
  degreeHeatingDays: number | null;
  dailyAlertLevel: number | null;
  weeklyAlertLevel: number | null;
}

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
 * Maps a daily_data row to the same shape `getCollectionData` returns, so the website can
 * use historical and latest values interchangeably. daily_data stores degree heating *days*,
 * while collectionData (like latest_data) exposes degree heating *weeks*.
 */
export const dailyDataToCollectionData = (
  row: Omit<DailyDataRow, 'siteId'>,
): CollectionDataDto =>
  omitBy(
    {
      satelliteTemperature: row.satelliteTemperature,
      dhw: isNil(row.degreeHeatingDays) ? null : row.degreeHeatingDays / 7,
      tempAlert: row.dailyAlertLevel,
      tempWeeklyAlert: row.weeklyAlertLevel,
    },
    isNil,
  );

/**
 * Same as `getCollectionData`, but for a past day (YYYY-MM-DD, UTC). For each site it uses
 * the most recent daily_data row on or before that day, within HISTORICAL_LOOKBACK_DAYS.
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

  const day = DateTime.fromISO(date, { zone: 'utc' });
  const end = day.endOf('day').toJSDate();
  const start = day
    .minus({ days: HISTORICAL_LOOKBACK_DAYS })
    .startOf('day')
    .toJSDate();

  const rows: DailyDataRow[] = await dailyDataRepository
    .createQueryBuilder('daily_data')
    .select('DISTINCT ON (daily_data.site_id) daily_data.site_id', 'siteId')
    .addSelect('daily_data.satellite_temperature', 'satelliteTemperature')
    .addSelect('daily_data.degree_heating_days', 'degreeHeatingDays')
    .addSelect('daily_data.daily_alert_level', 'dailyAlertLevel')
    .addSelect('daily_data.weekly_alert_level', 'weeklyAlertLevel')
    .where('daily_data.site_id IN (:...siteIds)', { siteIds })
    .andWhere('daily_data.date BETWEEN :start AND :end', { start, end })
    .orderBy('daily_data.site_id')
    .addOrderBy('daily_data.date', 'DESC')
    .getRawMany();

  return _(rows)
    .keyBy((row) => row.siteId)
    .mapValues(({ siteId, ...row }) => dailyDataToCollectionData(row))
    .toJSON();
};

export const heatStressTracker: DynamicCollection = {
  name: 'Heat Stress Tracker',
  sites: [],
  siteIds: [],
  isPublic: true,
};
