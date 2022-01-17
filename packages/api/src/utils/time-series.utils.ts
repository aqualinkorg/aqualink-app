import _, { omit } from 'lodash';
import { IsNull, Repository } from 'typeorm';
import { BadRequestException } from '@nestjs/common';
import { Site } from '../sites/sites.entity';
import { SourceType } from '../sites/schemas/source-type.enum';
import { Sources } from '../sites/sources.entity';
import { TimeSeriesValueDto } from '../time-series/dto/time-series-value.dto';
import { Metric } from '../time-series/metrics.entity';
import { TimeSeries } from '../time-series/time-series.entity';
import { getTimeSeriesDefaultDates } from './dates';
import { SiteSurveyPoint } from '../site-survey-points/site-survey-points.entity';

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
    : 'source.survey_point_id is NULL';

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
    .andWhere(metrics.length > 0 ? 'metric IN (:...metrics)' : '1=1', {
      metrics,
    })
    .andWhere(startDate ? 'timestamp >= :startDate' : '1=1', { startDate })
    .andWhere(endDate ? 'timestamp <= :endDate' : '1=1', { endDate });

  return hourly
    ? mainQuery
        .groupBy("date_trunc('hour', timestamp), metric, source.type")
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
      `source.site_id = :siteId AND ${surveyPointCondition}`,
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

export const surveyPointBelongsToSite = async (
  siteId: number,
  pointId: number,
  surveyPointRepository: Repository<SiteSurveyPoint>,
) => {
  const surveyPoint = await surveyPointRepository.findOne({
    where: { id: pointId },
  });

  if (surveyPoint?.siteId?.toString() !== siteId.toString()) {
    throw new BadRequestException(
      `Survey point with id ${surveyPoint?.id} does not belong to site with id ${siteId}.`,
    );
  }
};
