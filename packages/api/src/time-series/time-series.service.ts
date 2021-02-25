import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import _, { omit, zipObject } from 'lodash';
import { Repository } from 'typeorm';
import { Metric } from './metrics.entity';
import { TimeSeries } from './time-series.entity';
import { ReefDataDto } from './dto/reef-data.dto';
import { PoiDataDto } from './dto/poi-data.dto';

@Injectable()
export class TimeSeriesService {
  constructor(
    @InjectRepository(TimeSeries)
    private timeSeriesRepository: Repository<TimeSeries>,
  ) {}

  async findPoiData(
    startDate: Date,
    endDate: Date,
    metrics: Metric[],
    poiDataDto: PoiDataDto,
  ) {
    const { reefId, poiId } = poiDataDto;

    const data = await this.timeSeriesRepository
      .createQueryBuilder('time_series')
      .select('value')
      .addSelect('metric.metric', 'metric')
      .addSelect('timestamp')
      .innerJoin(
        'time_series.metric',
        'metric',
        'metric.metric IN (:...metrics)',
        { metrics },
      )
      .andWhere('reef_id = :reefId', { reefId })
      .andWhere('poi_id = :poiId', { poiId })
      .andWhere('timestamp >= :startDate', { startDate })
      .andWhere('timestamp <= :endDate', { endDate })
      .orderBy('timestamp', 'ASC')
      .getRawMany();

    const metricsKeys = Object.keys(Metric).map((key) => Metric[key]);
    const metricsValues = Object.keys(Metric).map((props) => []);
    const metricsObject = zipObject(metricsKeys, metricsValues);

    return _(data)
      .groupBy('metric')
      .mapValues((groupedData) => {
        return groupedData.map((o) => omit(o, 'metric'));
      })
      .merge(metricsObject);
  }

  async findReefData(
    startDate: Date,
    endDate: Date,
    metrics: Metric[],
    reefDataDto: ReefDataDto,
  ) {
    const { reefId } = reefDataDto;

    const data = await this.timeSeriesRepository
      .createQueryBuilder('time_series')
      .select('value')
      .addSelect('metric.metric', 'metric')
      .addSelect('timestamp')
      .innerJoin(
        'time_series.metric',
        'metric',
        'metric.metric IN (:...metrics)',
        { metrics },
      )
      .andWhere('reef_id = :reefId', { reefId })
      .andWhere('poi_id is NULL')
      .andWhere('timestamp >= :startDate', { startDate })
      .andWhere('timestamp <= :endDate', { endDate })
      .orderBy('timestamp', 'ASC')
      .getRawMany();

    const metricsKeys = Object.keys(Metric).map((key) => Metric[key]);
    const metricsValues = Object.keys(Metric).map((props) => []);
    const metricsObject = zipObject(metricsKeys, metricsValues);

    return _(data)
      .groupBy('metric')
      .mapValues((groupedData) => {
        return groupedData.map((o) => omit(o, 'metric'));
      })
      .merge(metricsObject);
  }
}
