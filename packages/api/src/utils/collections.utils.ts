import { BadRequestException } from '@nestjs/common';
import _, { camelCase } from 'lodash';
import { Brackets, Repository } from 'typeorm';
import { DynamicCollection } from '../collections/collections.entity';
import { CollectionDataDto } from '../collections/dto/collection-data.dto';
import { Site } from '../sites/sites.entity';
import { SourceType } from '../sites/schemas/source-type.enum';
import { LatestData } from '../time-series/latest-data.entity';
import { TimeSeries } from '../time-series/time-series.entity';
import { DateTime } from '../luxon-extensions';

// Look-back windows of the latest_data view, applied to a past day instead of today.
const HISTORICAL_LOOKBACK_DAYS = 7;
const LONG_LOOKBACK_SOURCES = [
  SourceType.SONDE,
  SourceType.HUI,
  SourceType.SHEET_DATA,
  SourceType.HWO,
];

/**
 * Returns rows shaped like the latest_data view, but as they would have been
 * at the end of the `until` day (YYYY-MM-DD, UTC): the most recent value of
 * each metric recorded on or before that day, within the same look-back
 * windows the view uses so that stale values are not shown for that day.
 * By default there is one row per site and metric; with `perSource` there is
 * one row per site, metric, source type and survey point, as in the view.
 */
export const getHistoricalLatestData = (
  siteIds: number[],
  latestDataRepository: Repository<LatestData>,
  until: string,
  { perSource = false, excludeHobo = true } = {},
): Promise<LatestData[]> => {
  const day = /^\d{4}-\d{2}-\d{2}$/.test(until)
    ? DateTime.fromISO(until, { zone: 'utc' })
    : undefined;
  if (!day?.isValid) {
    throw new BadRequestException(
      `Invalid date '${until}', expected YYYY-MM-DD`,
    );
  }
  const end = day.startOf('day').plus({ days: 1 });

  const distinctColumns = perSource
    ? [
        'sources.site_id',
        'time_series.metric',
        'sources.type',
        'sources.survey_point_id',
      ]
    : ['sources.site_id', 'time_series.metric'];

  const query = latestDataRepository.manager
    .createQueryBuilder()
    .select('time_series.id', 'id')
    .addSelect('time_series.timestamp', 'timestamp')
    .addSelect('time_series.value', 'value')
    .addSelect('sources.site_id', 'siteId')
    .addSelect('sources.survey_point_id', 'surveyPointId')
    .addSelect('time_series.metric', 'metric')
    .addSelect('sources.type', 'source')
    .from(TimeSeries, 'time_series')
    .distinctOn(distinctColumns)
    .innerJoin('sources', 'sources', 'sources.id = time_series.source_id')
    .where('sources.site_id IN (:...siteIds)', { siteIds })
    .andWhere('time_series.timestamp < :end', { end: end.toJSDate() })
    .andWhere(
      new Brackets((qb) =>
        qb
          .where('time_series.timestamp >= :shortStart', {
            shortStart: end
              .minus({ days: HISTORICAL_LOOKBACK_DAYS + 1 })
              .toJSDate(),
          })
          .orWhere(
            'sources.type IN (:...longSources) AND time_series.timestamp >= :longStart',
            {
              longSources: LONG_LOOKBACK_SOURCES,
              longStart: end.minus({ years: 2 }).toJSDate(),
            },
          ),
      ),
    );

  if (excludeHobo) {
    query.andWhere('sources.type != :hoboSource', {
      hoboSource: SourceType.HOBO,
    });
  }

  // DISTINCT ON keeps the first row of each group, i.e. the most recent one.
  distinctColumns.forEach((column) => query.addOrderBy(column));
  return query.addOrderBy('time_series.timestamp', 'DESC').getRawMany();
};

export const getCollectionData = async (
  sites: Site[],
  latestDataRepository: Repository<LatestData>,
  until?: string,
): Promise<Record<number, CollectionDataDto>> => {
  const siteIds = sites.map((site) => site.id);

  if (!siteIds.length) {
    return {};
  }

  const latestData: LatestData[] = until
    ? await getHistoricalLatestData(siteIds, latestDataRepository, until)
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
