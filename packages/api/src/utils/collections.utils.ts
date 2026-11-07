import _, { camelCase, isNil, omitBy } from 'lodash';
import { BadRequestException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { DateTime } from '../luxon-extensions';
import { DynamicCollection } from '../collections/collections.entity';
import { CollectionDataDto } from '../collections/dto/collection-data.dto';
import { DailyData } from '../sites/daily-data.entity';
import { Site } from '../sites/sites.entity';
import { SourceType } from '../sites/schemas/source-type.enum';
import { LatestData } from '../time-series/latest-data.entity';

export interface HistoricalCollectionContext {
  dailyDataRepository: Repository<DailyData>;
  date: string;
}

interface HistoricalDailyRow {
  siteId: number;
  satelliteTemperature: number | null;
  degreeHeatingDays: number | null;
  dailyAlertLevel: number | null;
  weeklyAlertLevel: number | null;
}

/**
 * Resolves the UTC end-of-day cutoff timestamp for historical daily_data queries
 * so all satellite and bleaching observations recorded on the target date are included.
 */
export const parseHistoricalCutoffDate = (date: string): Date => {
  const parsed = DateTime.fromISO(date, { zone: 'utc' });
  if (!parsed.isValid) {
    throw new BadRequestException('Date is not a valid date');
  }
  return parsed.endOf('day').toJSDate();
};

/**
 * Maps a raw daily_data record into the public CollectionDataDto shape,
 * converting degree heating days into degree heating weeks (DHW = DHD / 7).
 */
const mapHistoricalRowToCollectionData = (
  row: HistoricalDailyRow,
): CollectionDataDto =>
  omitBy(
    {
      satelliteTemperature: row.satelliteTemperature,
      dhw: isNil(row.degreeHeatingDays) ? null : row.degreeHeatingDays / 7,
      tempAlert: row.dailyAlertLevel,
      tempWeeklyAlert: row.weeklyAlertLevel ?? row.dailyAlertLevel,
    },
    isNil,
  ) as CollectionDataDto;

/**
 * Aggregates the most recent non-HOBO sensor metrics per site for live map and site views.
 */
export const getCollectionData = async (
  sites: Site[],
  latestDataRepository: Repository<LatestData>,
): Promise<Record<number, CollectionDataDto>> => {
  const siteIds = sites.map((site) => site.id);

  if (!siteIds.length) {
    return {};
  }

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
 * Fetches the latest daily_data snapshot on or before the requested UTC date for each site
 * so map markers and site summary cards reflect historical bleaching and SST conditions.
 */
export const getHistoricalCollectionData = async (
  sites: Site[],
  context: HistoricalCollectionContext,
): Promise<Record<number, CollectionDataDto>> => {
  const endOfDate = parseHistoricalCutoffDate(context.date);
  const siteIds = sites.map((site) => site.id);

  if (!siteIds.length) {
    return {};
  }

  const historicalRows = await context.dailyDataRepository
    .createQueryBuilder('daily_data')
    .distinctOn(['daily_data.site_id'])
    .select('daily_data.site_id', 'siteId')
    .addSelect('daily_data.satellite_temperature', 'satelliteTemperature')
    .addSelect('daily_data.degree_heating_days', 'degreeHeatingDays')
    .addSelect('daily_data.daily_alert_level', 'dailyAlertLevel')
    .addSelect('daily_data.weekly_alert_level', 'weeklyAlertLevel')
    .where('daily_data.site_id IN (:...siteIds)', { siteIds })
    .andWhere('daily_data.date <= :endOfDate', { endOfDate })
    .orderBy('daily_data.site_id', 'ASC')
    .addOrderBy('daily_data.date', 'DESC')
    .getRawMany<HistoricalDailyRow>();

  return historicalRows.reduce<Record<number, CollectionDataDto>>(
    (acc, row) => ({
      ...acc,
      [row.siteId]: mapHistoricalRowToCollectionData(row),
    }),
    {},
  );
};

export const heatStressTracker: DynamicCollection = {
  name: 'Heat Stress Tracker',
  sites: [],
  siteIds: [],
  isPublic: true,
};
