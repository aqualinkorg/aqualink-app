import _, { last, omit, isNull, merge } from 'lodash';
import { IsNull, Repository } from 'typeorm';
import { Site } from '../sites/sites.entity';
import { SourceType } from '../sites/schemas/source-type.enum';
import { Sources } from '../sites/sources.entity';
import { TimeSeriesValueDto } from '../time-series/dto/time-series-value.dto';
import { Metric } from '../time-series/metrics.entity';
import { TimeSeries } from '../time-series/time-series.entity';
import { getTimeSeriesDefaultDates } from './dates';

interface TimeSeriesGroupable {
  metric: Metric;
  source: SourceType;
  surveyPointId?: number;
  surveyPointName?: string;
}

export type TimeSeriesData = TimeSeriesGroupable & {
  value: number;
  timestamp: Date;
};

export type TimeSeriesRange = TimeSeriesGroupable & {
  maxDate: Date;
  minDate: Date;
};

interface SurveyPoint {
  id: number;
  name: string;
}

type TimeSeriesResponse<T> = Partial<
  Record<
    Metric,
    Partial<Record<SourceType, { surveyPoint?: SurveyPoint; data: T[] }>>
  >
>;

// TODO: Revisit the response structure and simplify when we have more metrics and sources available
export const groupByMetricAndSource = <T extends TimeSeriesGroupable>(
  data: T[],
): TimeSeriesResponse<
  Omit<T, 'metric' | 'source' | 'surveyPointId' | 'surveyPointName'>
> => {
  return _(data)
    .groupBy('metric')
    .mapValues((grouped) => {
      return _(grouped)
        .groupBy('source')
        .mapValues((groupedData) => {
          const { surveyPointId, surveyPointName } = last(groupedData) || {};
          return merge(
            !isNull(surveyPointId)
              ? { surveyPoint: { id: surveyPointId, name: surveyPointName } }
              : {},
            {
              data: groupedData
                .filter((o) =>
                  typeof surveyPointId === 'number'
                    ? surveyPointId === o.surveyPointId
                    : true,
                )
                .map((o) =>
                  omit(
                    o,
                    'metric',
                    'source',
                    'surveyPointId',
                    'surveyPointName',
                  ),
                ),
            },
          );
        })
        .toJSON();
    })
    .toJSON();
};

export const getDataQuery = (
  timeSeriesRepository: Repository<TimeSeries>,
  siteId: number,
  metrics: Metric[],
  start?: string,
  end?: string,
  hourly?: boolean,
  surveyPointId?: number,
): Promise<TimeSeriesData[]> => {
  const { endDate, startDate } = getTimeSeriesDefaultDates(start, end);

  const surveyPointCondition = surveyPointId
    ? `(source.survey_point_id = ${surveyPointId} OR source.survey_point_id is NULL)`
    : `1=1`;

  const mainQuery = timeSeriesRepository
    .createQueryBuilder('time_series')
    .select(hourly ? 'avg(value)' : 'value', 'value')
    .addSelect('metric')
    .addSelect('source.type', 'source')
    .addSelect(
      hourly ? "date_trunc('hour', timestamp)" : 'timestamp',
      'timestamp',
    )
    .innerJoin(
      'time_series.source',
      'source',
      `source.site_id = :siteId AND ${surveyPointCondition}`,
      { siteId },
    )
    .leftJoin('source.surveyPoint', 'surveyPoint')
    .addSelect('surveyPoint.id', 'surveyPointId')
    .addSelect('surveyPoint.name', 'surveyPointName')
    .andWhere(metrics.length > 0 ? 'metric IN (:...metrics)' : '1=1', {
      metrics,
    })
    .andWhere(startDate ? 'timestamp >= :startDate' : '1=1', { startDate })
    .andWhere(endDate ? 'timestamp <= :endDate' : '1=1', { endDate });

  return hourly
    ? mainQuery
        .groupBy(
          "date_trunc('hour', timestamp), metric, source.type, surveyPoint.id",
        )
        .orderBy("date_trunc('hour', timestamp)", 'ASC')
        .getRawMany()
    : mainQuery.orderBy('timestamp', 'ASC').getRawMany();
};

export const getDataRangeQuery = (
  timeSeriesRepository: Repository<TimeSeries>,
  siteId: number,
  surveyPointId?: number,
): Promise<TimeSeriesRange[]> => {
  const surveyPointCondition = surveyPointId
    ? `(source.survey_point_id = ${surveyPointId} OR source.survey_point_id is NULL)`
    : '1=1';

  return timeSeriesRepository
    .createQueryBuilder('time_series')
    .select('metric')
    .addSelect('source.type', 'source')
    .addSelect('MIN(timestamp)', 'minDate')
    .addSelect('MAX(timestamp)', 'maxDate')
    .innerJoin(
      'time_series.source',
      'source',
      `source.site_id = :siteId AND ${surveyPointCondition}`,
      { siteId },
    )
    .leftJoin('source.surveyPoint', 'surveyPoint')
    .addSelect('surveyPoint.id', 'surveyPointId')
    .addSelect('surveyPoint.name', 'surveyPointName')
    .groupBy('metric, source.type, surveyPoint.id')
    .orderBy('MAX(timestamp)', 'ASC')
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

/**
 * Fetches the spotter sources based on the site.
 * If no such source exists, it creates it
 * @param sites The selected site
 * @param type The SourceType
 * @param sourceRepository The necessary repository to perform the query
 * @returns The requested source entity
 */
export const getSources = (
  sites: Site[],
  type: SourceType,
  sourceRepository: Repository<Sources>,
) => {
  return sites.map((site) =>
    sourceRepository
      .findOne({
        relations: ['site'],
        where: {
          site,
          surveyPoint: IsNull(),
          type,
          sensorId: type === SourceType.SPOTTER ? site.sensorId : IsNull(),
        },
      })
      .then((source) => {
        // If the source exists return it
        if (source) {
          return source;
        }

        // Else create it and return the created entity
        return sourceRepository.save({
          site,
          type,
          sensorId: type === SourceType.SPOTTER ? site.sensorId : undefined,
        });
      }),
  );
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
