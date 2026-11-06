import _, { camelCase } from 'lodash';
import { Brackets, EntityManager, Repository } from 'typeorm';
import { DynamicCollection } from '../collections/collections.entity';
import { CollectionDataDto } from '../collections/dto/collection-data.dto';
import { Site } from '../sites/sites.entity';
import { SourceType } from '../sites/schemas/source-type.enum';
import { LatestData } from '../time-series/latest-data.entity';
import { TimeSeries } from '../time-series/time-series.entity';
import { DateTime } from '../luxon-extensions';

// Mirrors the windows used by the `latest_data` materialized view
// (see time-series/latest-data.entity.ts), anchored on a past date
// instead of `current_date`.
const LATEST_DATA_WINDOW_DAYS = 7;
const EXTENDED_WINDOW_YEARS = 2;
const EXTENDED_WINDOW_SOURCES = [
  SourceType.SONDE,
  SourceType.HUI,
  SourceType.SHEET_DATA,
  SourceType.HWO,
];

/**
 * Returns true when `date` (YYYY-MM-DD, UTC) is strictly before today.
 * Today and future dates are served from the live `latest_data` view.
 */
export const isHistoricalDate = (date?: string): date is string =>
  !!date &&
  DateTime.fromISO(date, { zone: 'utc' }) <
    DateTime.now().setZone('utc').startOf('day');

/**
 * Same shape as the `latest_data` view rows, but computed from `time_series`
 * as they were at the end of `date` (UTC): for each metric, source type,
 * site and survey point, the most recent value recorded on or before that
 * day, within the same look-back windows as the view.
 */
export const getLatestDataAtDate = (
  siteIds: number[],
  manager: EntityManager,
  date: string,
): Promise<LatestData[]> => {
  const end = DateTime.fromISO(date, { zone: 'utc' }).plus({ days: 1 });
  const dayStart = end.minus({ days: 1 });
  const windowStart = dayStart.minus({ days: LATEST_DATA_WINDOW_DAYS });
  const extendedWindowStart = dayStart.minus({ years: EXTENDED_WINDOW_YEARS });

  return manager
    .createQueryBuilder()
    .select('time_series.id', 'id')
    .distinctOn([
      'time_series.metric',
      'sources.type',
      'sources.site_id',
      'sources.survey_point_id',
    ])
    .addSelect('time_series.timestamp', 'timestamp')
    .addSelect('time_series.value', 'value')
    .addSelect('sources.site_id', 'siteId')
    .addSelect('sources.survey_point_id', 'surveyPointId')
    .addSelect('time_series.metric', 'metric')
    .addSelect('sources.type', 'source')
    .from(TimeSeries, 'time_series')
    .innerJoin('sources', 'sources', 'sources.id = time_series.source_id')
    .where('sources.site_id IN (:...siteIds)', { siteIds })
    .andWhere('sources.type != :hoboSource', { hoboSource: SourceType.HOBO })
    .andWhere('time_series.timestamp < :end', { end: end.toJSDate() })
    .andWhere(
      new Brackets((qb) => {
        qb.where('time_series.timestamp >= :windowStart', {
          windowStart: windowStart.toJSDate(),
        }).orWhere(
          'sources.type IN (:...extendedSources) AND time_series.timestamp >= :extendedWindowStart',
          {
            extendedSources: EXTENDED_WINDOW_SOURCES,
            extendedWindowStart: extendedWindowStart.toJSDate(),
          },
        );
      }),
    )
    .orderBy('time_series.metric', 'DESC')
    .addOrderBy('sources.type', 'DESC')
    .addOrderBy('sources.site_id', 'DESC')
    .addOrderBy('sources.survey_point_id', 'DESC')
    .addOrderBy('time_series.timestamp', 'DESC')
    .getRawMany();
};

export const getCollectionData = async (
  sites: Site[],
  latestDataRepository: Repository<LatestData>,
  date?: string,
): Promise<Record<number, CollectionDataDto>> => {
  const siteIds = sites.map((site) => site.id);

  if (!siteIds.length) {
    return {};
  }

  // Get latest data, either live or as it was at the end of the requested day
  const latestData: LatestData[] = isHistoricalDate(date)
    ? await getLatestDataAtDate(siteIds, latestDataRepository.manager, date)
    : await latestDataRepository
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
