import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { groupBy } from 'lodash';
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
      .select('avg(value)', 'value')
      .addSelect('metric.metric', 'metric')
      .addSelect("date_trunc('day', timestamp)", 'timestamp')
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
      .groupBy("date_trunc('day', timestamp), metric.metric, metric.id")
      .orderBy('timestamp', 'ASC')
      .getRawMany();

    return groupBy(data, 'metric');
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
      .select('avg(value)', 'value')
      .addSelect('metric.metric', 'metric')
      .addSelect("date_trunc('day', timestamp)", 'timestamp')
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
      .groupBy("date_trunc('day', timestamp), metric.metric, metric.id")
      .orderBy('timestamp', 'ASC')
      .getRawMany();

    return groupBy(data, 'metric');
  }
}
