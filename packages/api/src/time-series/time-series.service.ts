import { InjectRepository } from '@nestjs/typeorm';
import { unlinkSync } from 'fs';
import { Repository } from 'typeorm';
import Bluebird from 'bluebird';
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
import {
  Mimetype,
  uploadTimeSeriesData,
} from '../utils/uploads/upload-sheet-data';
import { SourceType } from '../sites/schemas/source-type.enum';
import { DataUploads } from '../data-uploads/data-uploads.entity';
import { surveyPointBelongsToSite } from '../utils/site.utils';

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

    @InjectRepository(DataUploads)
    private dataUploadsRepository: Repository<DataUploads>,
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

    await surveyPointBelongsToSite(
      siteId,
      surveyPointId,
      this.surveyPointRepository,
    );

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
    files: Express.Multer.File[],
    failOnWarning?: boolean,
  ) {
    if (!sensor || !Object.values(SourceType).includes(sensor)) {
      throw new BadRequestException(
        `Field 'sensor' is required and must have one of the following values: ${Object.values(
          SourceType,
        ).join(', ')}`,
      );
    }

    const { siteId, surveyPointId } = surveyPointDataRangeDto;

    await surveyPointBelongsToSite(
      siteId,
      surveyPointId,
      this.surveyPointRepository,
    );

    if (!files?.length) {
      throw new BadRequestException(
        'The upload must contain at least one file',
      );
    }

    const uploadResponse = await Bluebird.Promise.map(
      files,
      async ({ path, originalname, mimetype }) => {
        try {
          const ignoredHeaders = await uploadTimeSeriesData(
            path,
            originalname,
            mimetype as Mimetype,
            siteId.toString(),
            surveyPointId.toString(),
            sensor,
            {
              siteRepository: this.siteRepository,
              sourcesRepository: this.sourcesRepository,
              surveyPointRepository: this.surveyPointRepository,
              timeSeriesRepository: this.timeSeriesRepository,
              dataUploadsRepository: this.dataUploadsRepository,
            },
            failOnWarning,
          );
          return { file: originalname, ignoredHeaders };
        } finally {
          // Remove file once its processing is over
          unlinkSync(path);
        }
      },
      {
        concurrency: 1,
      },
    );

    return uploadResponse;
  }
}
