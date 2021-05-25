import _, { omit } from 'lodash';
import { IsNull, Repository } from 'typeorm';
import { Metric } from '../time-series/metrics.entity';
import { TimeSeries } from '../time-series/time-series.entity';
import { Reef } from '../reefs/reefs.entity';
import { Sources, SourceType } from '../reefs/sources.entity';

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
    ? `(time_series.poi_id = ${poiId} OR time_series.poi_id is NULL)`
    : 'time_series.poi_id is NULL';

  return hourly
    ? timeSeriesRepository
        .createQueryBuilder('time_series')
        .select('avg(value)', 'value')
        .addSelect('metric')
        .addSelect('source.type', 'source')
        .addSelect("date_trunc('hour', timestamp)", 'timestamp')
        .innerJoin('time_series.source', 'source')
        .andWhere('metric IN (:...metrics)', { metrics })
        .andWhere('time_series.reef_id = :reefId', { reefId })
        .andWhere(poiCondition)
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
        .innerJoin('time_series.source', 'source')
        .andWhere('metric IN (:...metrics)', { metrics })
        .andWhere('time_series.reef_id = :reefId', { reefId })
        .andWhere(poiCondition)
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
    ? `(time_series.poi_id = ${poiId} OR time_series.poi_id is NULL)`
    : 'time_series.poi_id is NULL';

  return timeSeriesRepository
    .createQueryBuilder('time_series')
    .select('metric')
    .addSelect('source.type', 'source')
    .addSelect('MIN(timestamp)', 'minDate')
    .addSelect('MAX(timestamp)', 'maxDate')
    .innerJoin('time_series.source', 'source')
    .andWhere('time_series.reef_id = :reefId', { reefId })
    .andWhere(poiCondition)
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
      relations: ['reef'],
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

export const insertSSTToTimeSeries = async (
  reef: Reef,
  satelliteTemperature: number,
  timestamp: Date,
  NOAASource: Sources,
  timeSeriesRepository: Repository<TimeSeries>,
) => {
  return timeSeriesRepository
    .createQueryBuilder('time_series')
    .insert()
    .values({
      source: NOAASource,
      metric: Metric.SATELLITE_TEMPERATURE,
      timestamp,
      reef,
      value: satelliteTemperature,
    })
    .onConflict('ON CONSTRAINT "no_duplicate_reef_data" DO NOTHING')
    .execute();
};
