import _, { omit } from 'lodash';
import { IsNull, Repository } from 'typeorm';
import { Site } from '../sites/sites.entity';
import { SourceType } from '../sites/schemas/source-type.enum';
import { Sources } from '../sites/sources.entity';
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
  siteId: number,
  surveyPointId?: number,
): Promise<TimeSeriesData[]> => {
  const poiCondition = surveyPointId
    ? `(source.survey_point_id = ${surveyPointId} OR source.survey_point_id is NULL)`
    : 'source.survey_point_id is NULL';

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
          `source.site_id = :siteId AND ${poiCondition}`,
          { siteId },
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
          `source.site_id = :siteId AND ${poiCondition}`,
          { siteId },
        )
        .andWhere('metric IN (:...metrics)', { metrics })
        .andWhere('timestamp >= :startDate', { startDate })
        .andWhere('timestamp <= :endDate', { endDate })
        .orderBy('timestamp', 'ASC')
        .getRawMany();
};

export const getDataRangeQuery = (
  timeSeriesRepository: Repository<TimeSeries>,
  siteId: number,
  surveyPointId?: number,
): Promise<TimeSeriesRange[]> => {
  const poiCondition = surveyPointId
    ? `(source.survey_point_id = ${surveyPointId} OR source.survey_point_id is NULL)`
    : 'source.survey_point_id is NULL';

  return timeSeriesRepository
    .createQueryBuilder('time_series')
    .select('metric')
    .addSelect('source.type', 'source')
    .addSelect('MIN(timestamp)', 'minDate')
    .addSelect('MAX(timestamp)', 'maxDate')
    .innerJoin(
      'time_series.source',
      'source',
      `source.site_id = :siteId AND ${poiCondition}`,
      { siteId },
    )
    .groupBy('metric, source.type')
    .getRawMany();
};

/**
 * Fetch existing NOAA sources based on the sites.
 * If the source does not exists create it.
 * @param site The site entity
 * @param sourcesRepository The repository needed to make the query
 * @returns The source found or created
 */
export const getNOAASource = async (
  site: Site,
  sourcesRepository: Repository<Sources>,
) => {
  return sourcesRepository
    .findOne({
      where: {
        site,
        type: SourceType.NOAA,
        surveyPoint: IsNull(),
      },
      relations: ['site', 'site.historicalMonthlyMean'],
    })
    .then((source) => {
      // If source exists return it
      if (source) {
        return source;
      }

      // Else create it and return the created entity
      return sourcesRepository.save({
        site,
        type: SourceType.NOAA,
      });
    });
};

export const insertSiteDataToTimeSeries = (
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
