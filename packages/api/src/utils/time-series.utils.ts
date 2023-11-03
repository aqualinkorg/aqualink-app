import { IsNull, Repository } from 'typeorm';
import { Site } from '../sites/sites.entity';
import { SourceType } from '../sites/schemas/source-type.enum';
import { Sources } from '../sites/sources.entity';
import { TimeSeriesValueDto } from '../time-series/dto/time-series-value.dto';
import { TimeSeries } from '../time-series/time-series.entity';
import { getTimeSeriesDefaultDates } from './dates';
import { Metric } from '../time-series/metrics.enum';

interface TimeSeriesGroupable {
  metric: Metric;
  source: SourceType;
  depth: number | null;
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
    { type: SourceType; depth: number; surveyPoint?: SurveyPoint; data: T[] }[]
  >
>;

// TODO: Revisit the response structure and simplify when we have more metrics and sources available
export const groupByMetricAndSource = <T extends TimeSeriesGroupable>(
  data: T[],
): TimeSeriesResponse<
  Omit<T, 'metric' | 'source' | 'surveyPointId' | 'surveyPointName' | 'depth'>
> => {
  const groupedByMetricMap = new Map<Metric, T[]>();
  data.forEach((x) => {
    const item = groupedByMetricMap.get(x.metric);
    if (item !== undefined) {
      groupedByMetricMap.set(x.metric, [...item, x]);
    } else {
      groupedByMetricMap.set(x.metric, [x]);
    }
  });

  const entries = Array.from(groupedByMetricMap.entries());

  const groupedByPointTypeDepth = entries.map(([key, val]) => {
    const groupByMap = new Map<string, T[]>();
    val.forEach((x) => {
      const groupByKey = `${x.surveyPointId}_${x.source}_${x.depth}`;
      const item = groupByMap.get(groupByKey);
      if (item !== undefined) {
        groupByMap.set(groupByKey, [...item, x]);
      } else {
        groupByMap.set(groupByKey, [x]);
      }
    });

    const values = Array.from(groupByMap.values());
    const formatted = values.map((raw) => {
      const omittedBy = raw.map((x) => {
        const {
          metric,
          source,
          surveyPointId,
          surveyPointName,
          depth,
          ...rest
        } = x;
        return rest;
      });

      // all items should have the same source, pointId and depth, since we grouped them
      const item = raw[0];

      // this should never happen
      if (!item) throw new Error('Empty set of (source, pointId, depth)');

      return {
        type: item.source,
        depth: item.depth,
        surveyPoint: { id: item.surveyPointId, name: item.surveyPointName },
        data: omittedBy,
      };
    });

    return [key, formatted];
  });

  return Object.fromEntries(groupedByPointTypeDepth);
};

export const getAvailableMetricsQuery = ({
  timeSeriesRepository,
  siteId,
  start: startDate,
  end: endDate,
  surveyPointId,
  metrics,
}: {
  timeSeriesRepository: Repository<TimeSeries>;
  siteId: number;
  start?: string;
  end?: string;
  surveyPointId?: number;
  metrics: Metric[];
}) => {
  const { sql: surveyPointConditionSql, params: surveyPointConditionParams } =
    surveyPointId
      ? {
          sql: 'AND (source.survey_point_id = :surveyPointId OR source.survey_point_id IS NULL)',
          params: { surveyPointId },
        }
      : { sql: '', params: {} };

  const query = timeSeriesRepository
    .createQueryBuilder('time_series')
    .select('metric')
    .addSelect('source.type', 'source')
    .addSelect('source.depth', 'depth')
    .distinct(true)
    .innerJoin(
      'time_series.source',
      'source',
      `source.site_id = :siteId ${surveyPointConditionSql}`,
      { siteId, ...surveyPointConditionParams },
    )
    .leftJoin('source.surveyPoint', 'surveyPoint');

  const withStartDate = startDate
    ? query.andWhere('timestamp >= :startDate', { startDate })
    : query;

  const withEndDate = endDate
    ? withStartDate.andWhere('timestamp <= :endDate', { endDate })
    : withStartDate;

  const withMetrics =
    metrics.length > 0
      ? withEndDate.andWhere('metric IN (:...metrics)', { metrics })
      : withEndDate;

  return withMetrics.getRawMany();
};

export const getAvailableDataDates = ({
  timeSeriesRepository,
  siteId,
  surveyPointId,
  metrics,
}: {
  timeSeriesRepository: Repository<TimeSeries>;
  siteId: number;
  surveyPointId?: number;
  metrics: Metric[];
}): Promise<{ min: Date; max: Date } | undefined> => {
  const { sql: surveyPointConditionSql, params: surveyPointConditionParams } =
    surveyPointId
      ? {
          sql: 'AND (source.survey_point_id = :surveyPointId OR source.survey_point_id IS NULL)',
          params: { surveyPointId },
        }
      : { sql: '', params: {} };

  const query = timeSeriesRepository
    .createQueryBuilder('time_series')
    .select('min("timestamp")')
    .addSelect('max("timestamp")')
    .innerJoin(
      'time_series.source',
      'source',
      `source.site_id = :siteId ${surveyPointConditionSql}`,
      { siteId, ...surveyPointConditionParams },
    )
    .leftJoin('source.surveyPoint', 'surveyPoint');

  const withMetrics =
    metrics.length > 0
      ? query.andWhere('metric IN (:...metrics)', {
          metrics,
        })
      : query;

  return withMetrics.getRawOne();
};

interface GetDataQueryParams {
  timeSeriesRepository: Repository<TimeSeries>;
  siteId: number;
  metrics: Metric[];
  start?: string;
  end?: string;
  hourly?: boolean;
  surveyPointId?: number;
  csv?: boolean;
  order?: 'ASC' | 'DESC';
}

export const getDataQuery = ({
  timeSeriesRepository,
  siteId,
  metrics,
  start,
  end,
  hourly,
  surveyPointId,
  csv = false,
  order = 'ASC',
}: GetDataQueryParams): Promise<TimeSeriesData[]> => {
  const { endDate, startDate } = csv
    ? { startDate: start, endDate: end }
    : getTimeSeriesDefaultDates(start, end);

  const { sql: surveyPointConditionSql, params: surveyPointConditionParams } =
    surveyPointId
      ? {
          sql: 'AND (source.survey_point_id = :surveyPointId OR source.survey_point_id IS NULL)',
          params: { surveyPointId },
        }
      : { sql: '', params: {} };

  const query = timeSeriesRepository
    .createQueryBuilder('time_series')
    .select(hourly ? 'avg(value)' : 'value', 'value')
    .addSelect('metric')
    .addSelect('source.type', 'source')
    .addSelect(
      hourly ? "date_trunc('hour', timestamp)" : 'timestamp',
      'timestamp',
    )
    .addSelect('source.depth', 'depth')
    .innerJoin(
      'time_series.source',
      'source',
      `source.site_id = :siteId ${surveyPointConditionSql}`,
      { siteId, ...surveyPointConditionParams },
    )
    .leftJoin('source.surveyPoint', 'surveyPoint')
    .addSelect('surveyPoint.id', 'surveyPointId')
    .addSelect('surveyPoint.name', 'surveyPointName');

  const withStartDate = startDate
    ? query.andWhere('timestamp >= :startDate', { startDate })
    : query;

  const withEndDate = endDate
    ? withStartDate.andWhere('timestamp <= :endDate', { endDate })
    : withStartDate;

  const withMetrics =
    metrics.length > 0
      ? withEndDate.andWhere('metric IN (:...metrics)', { metrics })
      : withEndDate;

  return hourly
    ? withMetrics
        .groupBy(
          "date_trunc('hour', timestamp), metric, source.type, surveyPoint.id, source.depth",
        )
        .orderBy("date_trunc('hour', timestamp)", order)
        .getRawMany()
    : withMetrics.orderBy('timestamp', order).getRawMany();
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
    .addSelect('source.depth', 'depth')
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
    .groupBy('metric, source.type, surveyPoint.id, source.depth')
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
        site: { id: site.id },
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
          site: { id: site.id },
          surveyPoint: IsNull(),
          type,
          sensorId:
            type === SourceType.SPOTTER && site.sensorId !== null
              ? site.sensorId
              : IsNull(),
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

export const getRandomID = (length = 7) =>
  (Math.random() + 1).toString(36).substring(length);

export const refreshMaterializedView = async (repository: Repository<any>) => {
  const id = getRandomID();
  // eslint-disable-next-line no-console
  console.time(`Refresh Materialized View ${id}`);
  await repository.query('REFRESH MATERIALIZED VIEW latest_data');
  // eslint-disable-next-line no-console
  console.timeEnd(`Refresh Materialized View ${id}`);
};
