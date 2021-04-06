import { InjectRepository } from '@nestjs/typeorm';
import _, { omit } from 'lodash';
import { Repository } from 'typeorm';
import { Injectable, Logger } from '@nestjs/common';
import { ReefDataDto } from './dto/reef-data.dto';
import { PoiDataDto } from './dto/poi-data.dto';
import { Metric } from './metrics.entity';
import { TimeSeries } from './time-series.entity';
import { PoiDataRangeDto } from './dto/poi-data-range.dto';
import { SourceType } from '../reefs/sources.entity';
import { ReefDataRangeDto } from './dto/reef-data-range.dto';

interface TimeSeriesData {
  value: number;
  timestamp: Date;
  metric: Metric;
  source: SourceType;
}

interface TimeSeriesRange {
  maxDate: Date;
  minDate: Date;
  metric: Metric;
  source: SourceType;
}

interface TimeSeriesGroupable {
  metric: Metric;
  source: SourceType;
}

type TimeSeriesResponse<T> = {
  [key in SourceType]: { [key in Metric]: T[] };
};

@Injectable()
export class TimeSeriesService {
  private logger = new Logger(TimeSeriesService.name);

  // TODO: Revisit the response structure and simplify when we have more metrics and sources available
  private readonly emptyMetricsSourcesObject = Object.values(SourceType).reduce(
    (root, key) => ({
      ...root,
      [key]: Object.values(Metric).reduce(
        (sources, source) => ({ ...sources, [source]: [] }),
        {},
      ),
    }),
    {},
  ) as TimeSeriesResponse<TimeSeriesGroupable>;

  constructor(
    @InjectRepository(TimeSeries)
    private timeSeriesRepository: Repository<TimeSeries>,
  ) {}

  private groupByMetricAndSource<T extends TimeSeriesGroupable>(
    data: T[],
  ): TimeSeriesResponse<Pick<T, 'metric' | 'source'>> {
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
      .merge(this.emptyMetricsSourcesObject)
      .toJSON();
  }

  private getDataQuery(
    startDate: Date,
    endDate: Date,
    metrics: Metric[],
    hourly: boolean,
    reefId: number,
    poiId?: number,
  ): Promise<TimeSeriesData[]> {
    const poiCondition = poiId
      ? `(time_series.poi_id = ${poiId} OR time_series.poi_id is NULL)`
      : 'time_series.poi_id is NULL';

    return hourly
      ? this.timeSeriesRepository
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
      : this.timeSeriesRepository
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
  }

  private getDataRangeQuery(
    reefId: number,
    poiId?: number,
  ): Promise<TimeSeriesRange[]> {
    const poiCondition = poiId
      ? `(time_series.poi_id = ${poiId} OR time_series.poi_id is NULL)`
      : 'time_series.poi_id is NULL';

    return this.timeSeriesRepository
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
  }

  async findPoiData(
    startDate: Date,
    endDate: Date,
    metrics: Metric[],
    hourly: boolean,
    poiDataDto: PoiDataDto,
  ) {
    const { reefId, poiId } = poiDataDto;

    const data: TimeSeriesData[] = await this.getDataQuery(
      startDate,
      endDate,
      metrics,
      hourly,
      reefId,
      poiId,
    );

    return this.groupByMetricAndSource(data);
  }

  async findReefData(
    startDate: Date,
    endDate: Date,
    metrics: Metric[],
    hourly: boolean,
    reefDataDto: ReefDataDto,
  ) {
    const { reefId } = reefDataDto;

    const data: TimeSeriesData[] = await this.getDataQuery(
      startDate,
      endDate,
      metrics,
      hourly,
      reefId,
    );

    return this.groupByMetricAndSource(data);
  }

  async findPoiDataRange(poiDataRangeDto: PoiDataRangeDto) {
    const { reefId, poiId } = poiDataRangeDto;

    const data = await this.getDataRangeQuery(reefId, poiId);

    return this.groupByMetricAndSource(data);
  }

  async findReefDataRange(reefDataRangeDto: ReefDataRangeDto) {
    const { reefId } = reefDataRangeDto;

    const data = await this.getDataRangeQuery(reefId);

    return this.groupByMetricAndSource(data);
  }
}
