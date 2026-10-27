import { BadRequestException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { DateTime } from '../luxon-extensions';
import { SourceType } from '../sites/schemas/source-type.enum';
import { LatestData } from '../time-series/latest-data.entity';
import { TimeSeries } from '../time-series/time-series.entity';

export const historicalDateBounds = (asOf: string) => {
  const start = DateTime.fromISO(asOf, { zone: 'utc' });
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(asOf) ||
    !start.isValid ||
    start > DateTime.utc().startOf('day')
  ) {
    throw new BadRequestException(
      'asOf must be a valid UTC date, not in the future',
    );
  }
  return { start: start.toJSDate(), end: start.plus({ days: 1 }).toJSDate() };
};

// Apply the same freshness windows as latest_data, relative to the selected
// day. The live materialized view cannot supply observations from past dates.
export const getHistoricalData = async (
  siteIds: number[],
  latestDataRepository: Repository<LatestData>,
  asOf: string,
): Promise<LatestData[]> => {
  const { start, end } = historicalDateBounds(asOf);
  if (!siteIds.length) return [];

  return latestDataRepository.manager
    .getRepository(TimeSeries)
    .createQueryBuilder('time_series')
    .select(
      'DISTINCT ON (metric, type, site_id, survey_point_id) time_series.id',
      'id',
    )
    .addSelect('timestamp')
    .addSelect('value')
    .addSelect('site_id', 'siteId')
    .addSelect('survey_point_id', 'surveyPointId')
    .addSelect('metric')
    .addSelect('type', 'source')
    .innerJoin('sources', 'sources', 'sources.id = time_series.source_id')
    .where('site_id IN (:...siteIds)', { siteIds })
    .andWhere('timestamp < :end', { end })
    .andWhere(
      `(timestamp >= CAST(:start AS timestamp) - INTERVAL '7 days'
        OR (type IN (:...longLivedSources)
          AND timestamp >= CAST(:start AS timestamp) - INTERVAL '2 years'))`,
      {
        start,
        longLivedSources: [
          SourceType.SONDE,
          SourceType.HUI,
          SourceType.SHEET_DATA,
          SourceType.HWO,
        ],
      },
    )
    .orderBy('metric, type, site_id, survey_point_id, timestamp', 'DESC')
    .addOrderBy('time_series.id', 'DESC')
    .getRawMany<LatestData>();
};
