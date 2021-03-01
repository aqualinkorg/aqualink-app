import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import _, { omit } from 'lodash';
import { Repository } from 'typeorm';
import { Metric } from './metrics.entity';
import { TimeSeries } from './time-series.entity';
import { ReefDataDto } from './dto/reef-data.dto';
import { PoiDataDto } from './dto/poi-data.dto';
import { DataRangeDto } from './dto/data-range.dto';

@Injectable()
export class TimeSeriesService {
  private readonly metricsObject = Object.values(Metric).reduce(
    (obj, key) => ({ ...obj, [key]: [] }),
    {},
  );

  constructor(
    @InjectRepository(TimeSeries)
    private timeSeriesRepository: Repository<TimeSeries>,
  ) {}

  private groupByMetric(data: any[]) {
    return _(data)
      .groupBy('metric')
      .mapValues((groupedData) => {
        return groupedData.map((o) => omit(o, 'metric'));
      })
      .merge(this.metricsObject);
  }

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
      .addSelect('metric')
      .addSelect('timestamp')
      .andWhere('metric IN (:...metrics)', { metrics })
      .andWhere('reef_id = :reefId', { reefId })
      .andWhere('poi_id = :poiId', { poiId })
      .andWhere('timestamp >= :startDate', { startDate })
      .andWhere('timestamp <= :endDate', { endDate })
      .orderBy('timestamp', 'ASC')
      .getRawMany();

    return this.groupByMetric(data);
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
      .addSelect('metric')
      .addSelect('timestamp')
      .andWhere('metric IN (:...metrics)', { metrics })
      .andWhere('reef_id = :reefId', { reefId })
      .andWhere('poi_id is NULL')
      .andWhere('timestamp >= :startDate', { startDate })
      .andWhere('timestamp <= :endDate', { endDate })
      .orderBy('timestamp', 'ASC')
      .getRawMany();

    return this.groupByMetric(data);
  }

  async findDataRange(dataRangeDto: DataRangeDto) {
    const { reefId, poiId } = dataRangeDto;

    const data = await this.timeSeriesRepository
      .createQueryBuilder('time_series')
      .select('metric')
      .addSelect('MIN(timestamp)', 'minDate')
      .addSelect('MAX(timestamp)', 'maxDate')
      .andWhere('reef_id = :reefId', { reefId })
      .andWhere('poi_id = :poiId', { poiId })
      .groupBy('metric')
      .getRawMany();

    return this.groupByMetric(data);
  }
}
