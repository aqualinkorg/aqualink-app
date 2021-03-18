import { InjectRepository } from '@nestjs/typeorm';
import _, { omit } from 'lodash';
import { Repository } from 'typeorm';
import { Injectable, Logger } from '@nestjs/common';
import { ReefDataDto } from './dto/reef-data.dto';
import { PoiDataDto } from './dto/poi-data.dto';
import { Metric } from './metrics.entity';
import { TimeSeries } from './time-series.entity';
import { DataRangeDto } from './dto/data-range.dto';
import { SourceType } from '../reefs/sources.entity';

interface TimeSeriesData {
  value: number;
  timestamp: Date;
  metric: Metric;
}

@Injectable()
export class TimeSeriesService {
  private logger = new Logger(TimeSeriesService.name);

  private readonly emptyMetricsSourcesObject = Object.values(Metric).reduce(
    (root, key) => ({
      ...root,
      [key]: Object.values(SourceType).reduce(
        (sources, source) => ({ ...sources, [source]: [] }),
        {},
      ),
    }),
    {},
  );

  constructor(
    @InjectRepository(TimeSeries)
    private timeSeriesRepository: Repository<TimeSeries>,
  ) {}

  private groupByMetricAndSource(data: TimeSeriesData[]) {
    return _(data)
      .groupBy('metric')
      .mapValues((grouped) => {
        return _(grouped)
          .groupBy('source')
          .mapValues((groupedData) =>
            groupedData.map((o) => omit(o, 'metric', 'source')),
          )
          .toJSON();
      })
      .merge(this.emptyMetricsSourcesObject);
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
      ? `time_series.poi_id = ${poiId}`
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

    return _(this.groupByMetricAndSource(data));
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

    return _(this.groupByMetricAndSource(data));
  }

  async findDataRange(dataRangeDto: DataRangeDto) {
    const { reefId, poiId } = dataRangeDto;

    const data = await this.timeSeriesRepository
      .createQueryBuilder('time_series')
      .select('metric')
      .addSelect('source.type', 'source')
      .addSelect('MIN(timestamp)', 'minDate')
      .addSelect('MAX(timestamp)', 'maxDate')
      .innerJoin('time_series.source', 'source')
      .andWhere('time_series.reef_id = :reefId', { reefId })
      .andWhere('time_series.poi_id = :poiId', { poiId })
      .groupBy('metric, source.type')
      .getRawMany();

    return _(this.groupByMetricAndSource(data));
  }
}
