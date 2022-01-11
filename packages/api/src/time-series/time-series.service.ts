import { InjectRepository } from '@nestjs/typeorm';
import { unlinkSync } from 'fs';
import { Repository } from 'typeorm';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
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
import { Site } from '../sites/sites.entity';
import { SiteSurveyPoint } from '../site-survey-points/site-survey-points.entity';
import { Sources } from '../sites/sources.entity';
import { uploadSondeData } from '../utils/uploads/upload-sonde-data';
import { SourceType } from '../sites/schemas/source-type.enum';

@Injectable()
export class TimeSeriesService {
  private logger = new Logger(TimeSeriesService.name);

  constructor(
    @InjectRepository(TimeSeries)
    private timeSeriesRepository: Repository<TimeSeries>,

    @InjectRepository(Site)
    private siteRepository: Repository<Site>,

    @InjectRepository(SiteSurveyPoint)
    private surveyPointRepository: Repository<SiteSurveyPoint>,

    @InjectRepository(Sources)
    private sourcesRepository: Repository<Sources>,
  ) {}

  async findSurveyPointData(
    surveyPointDataDto: SurveyPointDataDto,
    metrics: Metric[],
    startDate?: string,
    endDate?: string,
    hourly?: boolean,
  ) {
    const { siteId, surveyPointId } = surveyPointDataDto;

    const data: TimeSeriesData[] = await getDataQuery(
      this.timeSeriesRepository,
      siteId,
      metrics,
      startDate,
      endDate,
      hourly,
      surveyPointId,
    );

    return groupByMetricAndSource(data);
  }

  async findSiteData(
    siteDataDto: SiteDataDto,
    metrics: Metric[],
    startDate?: string,
    endDate?: string,
    hourly?: boolean,
  ) {
    const { siteId } = siteDataDto;

    const data: TimeSeriesData[] = await getDataQuery(
      this.timeSeriesRepository,
      siteId,
      metrics,
      startDate,
      endDate,
      hourly,
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

  async uploadData(
    surveyPointDataRangeDto: SurveyPointDataRangeDto,
    sensor: SourceType,
    paths: string[],
  ) {
    if (!sensor) {
      throw new BadRequestException(
        `Field 'sensor' is required and must have one of the following values: ${Object.values(
          SourceType,
        ).join(', ')}`,
      );
    }

    const { siteId, surveyPointId } = surveyPointDataRangeDto;
    if (sensor === 'sonde') {
      paths.forEach(async (path) => {
        await uploadSondeData(
          path,
          siteId.toString(),
          surveyPointId.toString(),
          'sonde',
          {
            siteRepository: this.siteRepository,
            sourcesRepository: this.sourcesRepository,
            surveyPointRepository: this.surveyPointRepository,
            timeSeriesRepository: this.timeSeriesRepository,
          },
        );

        // Remove file once its processing is over
        unlinkSync(path);
      });
    }
  }
}
