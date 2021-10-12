import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Injectable, Logger } from '@nestjs/common';
import { SiteDataDto } from './dto/site-data.dto';
import { PoiDataDto } from './dto/survey-point-data.dto';
import { Metric } from './metrics.entity';
import { TimeSeries } from './time-series.entity';
import { PoiDataRangeDto } from './dto/survey-point-data-range.dto';
import { SiteDataRangeDto } from './dto/site-data-range.dto';
import {
  TimeSeriesData,
  getDataQuery,
  getDataRangeQuery,
  groupByMetricAndSource,
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
    hourly: boolean,
    poiDataDto: PoiDataDto,
  ) {
    const { siteId, surveyPointId } = poiDataDto;

    const data: TimeSeriesData[] = await getDataQuery(
      this.timeSeriesRepository,
      startDate,
      endDate,
      metrics,
      hourly,
      siteId,
      surveyPointId,
    );

    return groupByMetricAndSource(data);
  }

  async findSiteData(
    startDate: Date,
    endDate: Date,
    metrics: Metric[],
    hourly: boolean,
    siteDataDto: SiteDataDto,
  ) {
    const { siteId } = siteDataDto;

    const data: TimeSeriesData[] = await getDataQuery(
      this.timeSeriesRepository,
      startDate,
      endDate,
      metrics,
      hourly,
      siteId,
    );

    return groupByMetricAndSource(data);
  }

  async findPoiDataRange(poiDataRangeDto: PoiDataRangeDto) {
    const { siteId, surveyPointId } = poiDataRangeDto;

    const data = await getDataRangeQuery(
      this.timeSeriesRepository,
      siteId,
      surveyPointId,
    );

    return groupByMetricAndSource(data);
  }

  async findSiteDataRange(siteDataRangeDto: SiteDataRangeDto) {
    const { siteId } = siteDataRangeDto;

    const data = await getDataRangeQuery(this.timeSeriesRepository, siteId);

    return groupByMetricAndSource(data);
  }
}
