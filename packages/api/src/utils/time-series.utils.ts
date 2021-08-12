import _, { groupBy, keyBy, mapValues, omit } from 'lodash';
import { IsNull, Repository } from 'typeorm';
import { Reef } from '../reefs/reefs.entity';
import { SourceType } from '../reefs/schemas/source-type.enum';
import { Sources } from '../reefs/sources.entity';
import { SensorDataDto } from '../sensors/dto/sensor-data.dto';
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

export const getClosestTimeSeriesData = async (
  date: Date,
  reefId: number,
  metrics: Metric[],
  sourceTypes: SourceType[],
  timeSeriesRepository: Repository<TimeSeries>,
  sourcesRepository: Repository<Sources>,
  poiId?: number,
) => {
  const poiCondition = poiId
    ? `source.poi_id = ${poiId}`
    : 'source.poi_id IS NULL';
  // We will use this many times in our query, so we declare it as constant
  const diff = `(time_series.timestamp::timestamp - '${date.toISOString()}'::timestamp)`;

  // First get all sources needed to avoid inner join later
  const sources = await sourcesRepository
    .createQueryBuilder('source')
    .where('source.type IN (:...sourceTypes)', { sourceTypes })
    .andWhere('source.reef_id = :reefId', { reefId })
    .andWhere(poiCondition)
    .getMany();

  if (!sources.length) {
    return {};
  }

  // Create map from source_id to source entity
  const sourceMap = keyBy(sources, (source) => source.id);

  // Grab all data at an interval of +/- 24 hours around the diveDate
  // Order (descending) those data by the absolute time distance between the data and the survey diveDate
  // This way the closest data point for each metric for each source type will be the last row
  const timeSeriesData: TimeSeriesData[] = await timeSeriesRepository
    .createQueryBuilder('time_series')
    .select('time_series.timestamp', 'timestamp')
    .addSelect('time_series.value', 'value')
    .addSelect('time_series.metric', 'metric')
    .addSelect('time_series.source_id', 'source')
    .where(`${diff} < INTERVAL '1 d'`)
    .andWhere(`${diff} > INTERVAL '-1 d'`)
    .andWhere('time_series.metric IN (:...metrics)', { metrics })
    .andWhere('time_series.source_id IN (:...sourceIds)', {
      sourceIds: Object.keys(sourceMap),
    })
    .orderBy(
      `time_series.source_id, metric, (CASE WHEN ${diff} < INTERVAL '0' THEN (-${diff}) ELSE ${diff} END)`,
      'DESC',
    )
    .getRawMany();

  // Group the data by source id
  const groupedData = groupBy(timeSeriesData, (o) => o.source);

  return Object.keys(groupedData).reduce<SensorDataDto>((data, key) => {
    return {
      ...data,
      // Replace source id by source using the mapped source object
      // Keep only timestamps and value from the resulting objects
      [sourceMap[key].type]: mapValues(
        // Use key by to group the data by metric and keep only the last entry, i.e. the closest one
        keyBy(groupedData[key], (grouped) => grouped.metric),
        (v) => ({ timestamp: v.timestamp, value: v.value }),
      ),
    };
  }, {});
};
