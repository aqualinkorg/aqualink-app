import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Injectable, Logger } from '@nestjs/common';
import { ReefDataDto } from './dto/reef-data.dto';
import { PoiDataDto } from './dto/poi-data.dto';
import { Metric } from './metrics.entity';
import { TimeSeries } from './time-series.entity';
import { PoiDataRangeDto } from './dto/poi-data-range.dto';
import { ReefDataRangeDto } from './dto/reef-data-range.dto';
import {
  TimeSeriesData,
  getDataQuery,
  getDataRangeQuery,
  groupByMetricAndSource,
  TimeSeriesGrouping,
} from '../utils/time-series.utils';

@Injectable()
export class TimeSeriesService {
  private logger = new Logger(TimeSeriesService.name);

  constructor(
    @InjectRepository(TimeSeries)
    private timeSeriesRepository: Repository<TimeSeries>,
  ) {}

  async findPoiData(
    startDate: Date,
    endDate: Date,
    metrics: Metric[],
    poiDataDto: PoiDataDto,
    grouping?: TimeSeriesGrouping,
  ) {
    const { reefId, poiId } = poiDataDto;

    const data: TimeSeriesData[] = await getDataQuery(
      this.timeSeriesRepository,
      startDate,
      endDate,
      metrics,
      reefId,
      grouping,
      poiId,
    );

    return groupByMetricAndSource(data);
  }

  async findReefData(
    startDate: Date,
    endDate: Date,
    metrics: Metric[],
    reefDataDto: ReefDataDto,
    grouping?: TimeSeriesGrouping,
  ) {
    const { reefId } = reefDataDto;

    const data: TimeSeriesData[] = await getDataQuery(
      this.timeSeriesRepository,
      startDate,
      endDate,
      metrics,
      reefId,
      grouping,
    );

    return groupByMetricAndSource(data);
  }

  async findPoiDataRange(poiDataRangeDto: PoiDataRangeDto) {
    const { reefId, poiId } = poiDataRangeDto;

    const data = await getDataRangeQuery(
      this.timeSeriesRepository,
      reefId,
      poiId,
    );

    return groupByMetricAndSource(data);
  }

  async findReefDataRange(reefDataRangeDto: ReefDataRangeDto) {
    const { reefId } = reefDataRangeDto;

    const data = await getDataRangeQuery(this.timeSeriesRepository, reefId);

    return groupByMetricAndSource(data);
  }
}
