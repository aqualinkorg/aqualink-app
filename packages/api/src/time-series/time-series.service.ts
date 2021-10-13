import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Injectable, Logger } from '@nestjs/common';
import { SiteDataDto } from './dto/site-data.dto';
import { SurveyPointDataDto } from './dto/survey-point-data.dto';
import { Metric } from './metrics.entity';
import { TimeSeries } from './time-series.entity';
import { SurveyPointDataRangeDto } from './dto/survey-point-data-range.dto';
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

  async findSurveyPointData(
    startDate: Date,
    endDate: Date,
    metrics: Metric[],
    hourly: boolean,
    surveyPointDataDto: SurveyPointDataDto,
  ) {
    const { siteId, surveyPointId } = surveyPointDataDto;

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

  async findSurveyPointDataRange(
    surveyPointDataRangeDto: SurveyPointDataRangeDto,
  ) {
    const { siteId, surveyPointId } = surveyPointDataRangeDto;

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
