import _, { omit } from 'lodash';
import { IsNull, Repository } from 'typeorm';
import { Reef } from '../reefs/reefs.entity';
import { SourceType } from '../reefs/schemas/source-type.enum';
import { Sources } from '../reefs/sources.entity';
import { TimeSeriesValueDto } from '../time-series/dto/time-series-value.dto';
import { Metric } from '../time-series/metrics.entity';
import { TimeSeries } from '../time-series/time-series.entity';

export interface TimeSeriesData {
  value: number;
  timestamp: Date;
  metric: Metric;
  source: SourceType;
}

export interface TimeSeriesRange {
  maxDate: Date;
  minDate: Date;
  metric: Metric;
  source: SourceType;
}

interface TimeSeriesGroupable {
  metric: Metric;
  source: SourceType;
}

type TimeSeriesResponse<T> = Record<SourceType, Record<Metric, T[]>>;

// TODO: Revisit the response structure and simplify when we have more metrics and sources available
export const emptyMetricsSourcesObject = Object.values(SourceType).reduce(
  (root, key) => ({
    ...root,
    [key]: Object.values(Metric).reduce(
      (sources, source) => ({ ...sources, [source]: [] }),
      {},
    ),
  }),
  {},
) as TimeSeriesResponse<TimeSeriesGroupable>;

export const groupByMetricAndSource = <T extends TimeSeriesGroupable>(
  data: T[],
): TimeSeriesResponse<Pick<T, 'metric' | 'source'>> => {
  return _(data)
    .groupBy('source')
    .mapValues((grouped) => {
      return _(grouped)
        .groupBy('metric')
        .mapValues((groupedData) =>
          groupedData.map((o) => omit(o, 'metric', 'source')),
        )
        .toJSON();
    })
    .merge(emptyMetricsSourcesObject)
    .toJSON();
};

export const getDataQuery = (
  timeSeriesRepository: Repository<TimeSeries>,
  startDate: Date,
  endDate: Date,
  metrics: Metric[],
  hourly: boolean,
  reefId: number,
  poiId?: number,
): Promise<TimeSeriesData[]> => {
  const poiCondition = poiId
    ? `(source.poi_id = ${poiId} OR source.poi_id is NULL)`
    : 'source.poi_id is NULL';

  return hourly
    ? timeSeriesRepository
        .createQueryBuilder('time_series')
        .select('avg(value)', 'value')
        .addSelect('metric')
        .addSelect('source.type', 'source')
        .addSelect("date_trunc('hour', timestamp)", 'timestamp')
        .innerJoin(
          'time_series.source',
          'source',
          `source.reef_id = :reefId AND ${poiCondition}`,
          { reefId },
        )
        .andWhere('metric IN (:...metrics)', { metrics })
        .andWhere('timestamp >= :startDate', { startDate })
        .andWhere('timestamp <= :endDate', { endDate })
        .groupBy("date_trunc('hour', timestamp), metric, source.type")
        .orderBy("date_trunc('hour', timestamp)", 'ASC')
        .getRawMany()
    : timeSeriesRepository
        .createQueryBuilder('time_series')
        .select('value')
        .addSelect('metric')
        .addSelect('timestamp')
        .addSelect('source.type', 'source')
        .innerJoin(
          'time_series.source',
          'source',
          `source.reef_id = :reefId AND ${poiCondition}`,
          { reefId },
        )
        .andWhere('metric IN (:...metrics)', { metrics })
        .andWhere('timestamp >= :startDate', { startDate })
        .andWhere('timestamp <= :endDate', { endDate })
        .orderBy('timestamp', 'ASC')
        .getRawMany();
};

export const getDataRangeQuery = (
  timeSeriesRepository: Repository<TimeSeries>,
  reefId: number,
  poiId?: number,
): Promise<TimeSeriesRange[]> => {
  const poiCondition = poiId
    ? `(source.poi_id = ${poiId} OR source.poi_id is NULL)`
    : 'source.poi_id is NULL';

  return timeSeriesRepository
    .createQueryBuilder('time_series')
    .select('metric')
    .addSelect('source.type', 'source')
    .addSelect('MIN(timestamp)', 'minDate')
    .addSelect('MAX(timestamp)', 'maxDate')
    .innerJoin(
      'time_series.source',
      'source',
      `source.reef_id = :reefId AND ${poiCondition}`,
      { reefId },
    )
    .groupBy('metric, source.type')
    .getRawMany();
};

export const getNOAASource = async (
  reef: Reef,
  sourcesRepository: Repository<Sources>,
) => {
  return sourcesRepository
    .findOne({
      where: {
        reef,
        type: SourceType.NOAA,
        poi: IsNull(),
      },
      relations: ['reef', 'reef.historicalMonthlyMean'],
    })
    .then((source) => {
      if (source) {
        return source;
      }

      return sourcesRepository.save({
        reef,
        type: SourceType.NOAA,
      });
    });
};

export const insertReefDataToTimeSeries = (
  data: TimeSeriesValueDto[],
  metric: Metric,
  NOAASource: Sources,
  timeSeriesRepository: Repository<TimeSeries>,
) => {
  if (data.length === 0) {
    return null;
  }

  return timeSeriesRepository
    .createQueryBuilder('time_series')
    .insert()
    .values(
      data.map((dataPoint) => ({
        ...dataPoint,
        source: NOAASource,
        metric,
      })),
    )
    .onConflict('ON CONSTRAINT "no_duplicate_data" DO NOTHING')
    .execute();
};
