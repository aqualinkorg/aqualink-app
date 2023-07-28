import { InjectRepository } from '@nestjs/typeorm';
import { createReadStream, unlinkSync } from 'fs';
import { Repository } from 'typeorm';
import Bluebird from 'bluebird';
import type { Response } from 'express';
import moment from 'moment';
import {
  BadRequestException,
  HttpException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { join } from 'path';
// https://github.com/adaltas/node-csv/issues/372
// eslint-disable-next-line import/no-unresolved
import { stringify } from 'csv-stringify/sync';
import { SiteDataDto } from './dto/site-data.dto';
import { SurveyPointDataDto } from './dto/survey-point-data.dto';
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
import { SampleUploadFilesDto } from './dto/sample-upload-files.dto';
import { Metric } from './metrics.enum';
import { User } from '../users/users.entity';
import { DataUploadsSites } from '../data-uploads/data-uploads-sites.entity';

const DATE_FORMAT = 'YYYY_MM_DD';

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

    @InjectRepository(DataUploadsSites)
    private dataUploadsSitesRepository: Repository<DataUploadsSites>,
  ) {}

  async findSurveyPointData(
    surveyPointDataDto: SurveyPointDataDto,
    metrics: Metric[],
    startDate?: string,
    endDate?: string,
    hourly?: boolean,
  ) {
    const { siteId, surveyPointId } = surveyPointDataDto;

    const data: TimeSeriesData[] = await getDataQuery({
      timeSeriesRepository: this.timeSeriesRepository,
      siteId,
      metrics,
      start: startDate,
      end: endDate,
      hourly,
      surveyPointId,
    });

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

    const data: TimeSeriesData[] = await getDataQuery({
      timeSeriesRepository: this.timeSeriesRepository,
      siteId,
      metrics,
      start: startDate,
      end: endDate,
      hourly,
    });

    return groupByMetricAndSource(data);
  }

  async findSiteDataCsv(
    res: Response,
    siteDataDto: SiteDataDto,
    metrics: Metric[],
    startDate?: string,
    endDate?: string,
    hourly?: boolean,
  ) {
    const { siteId } = siteDataDto;

    const data: TimeSeriesData[] = await getDataQuery({
      timeSeriesRepository: this.timeSeriesRepository,
      siteId,
      metrics,
      start: startDate,
      end: endDate,
      hourly,
      csv: true,
    });

    const metricSourceAsKey = data.map((x) => ({
      key: `${x.metric}_${x.source}`,
      value: x.value,
      timestamp: x.timestamp,
    }));

    const allKeys = [
      'timestamp',
      ...new Map(metricSourceAsKey.map((x) => [x.key, x])).keys(),
    ];

    const emptyRow = Object.fromEntries(allKeys.map((x) => [x, undefined])) as {
      [k: string]: any;
    };

    const groupedByTimestamp = metricSourceAsKey.reduce(
      (acc, curr) => {
        const key = curr.timestamp.toISOString();
        const accValue = acc[key];
        if (typeof accValue === 'object') {
          // eslint-disable-next-line fp/no-mutating-methods
          accValue.push(curr);
        } else {
          // eslint-disable-next-line fp/no-mutation
          acc[key] = [curr];
        }
        return acc;
      },
      {} as {
        [k: string]: {
          key: string;
          value: number;
          timestamp: Date;
        }[];
      },
    );

    const rows = Object.entries(groupedByTimestamp).map(([timestamp, values]) =>
      values.reduce((acc, curr) => {
        // eslint-disable-next-line fp/no-mutation
        acc[curr.key] = curr.value;
        // eslint-disable-next-line fp/no-mutation
        acc.timestamp = timestamp;
        return acc;
      }, structuredClone(emptyRow)),
    );

    const fileName = `data_site_${siteId}_${moment(startDate).format(
      DATE_FORMAT,
    )}_${moment(endDate).format(DATE_FORMAT)}.csv`;

    res
      .set({
        'Content-Disposition': `attachment; filename=${encodeURIComponent(
          fileName,
        )}`,
      })
      .send(stringify(rows, { header: true }));
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

  async uploadData({
    user,
    sensor,
    files,
    multiSiteUpload,
    surveyPointDataRangeDto,
    failOnWarning,
  }: {
    user?: Express.User & User;
    sensor?: SourceType;
    files: Express.Multer.File[];
    multiSiteUpload: boolean;
    surveyPointDataRangeDto?: SurveyPointDataRangeDto;
    failOnWarning?: boolean;
  }) {
    if (sensor && !Object.values(SourceType).includes(sensor)) {
      throw new BadRequestException(
        `Field 'sensor' is required and must have one of the following values: ${Object.values(
          SourceType,
        ).join(', ')}`,
      );
    }

    const { siteId, surveyPointId } = surveyPointDataRangeDto || {};

    if (!files?.length) {
      throw new BadRequestException(
        'The upload must contain at least one file',
      );
    }

    const uploadResponse = await Bluebird.Promise.map(
      files,
      async ({ path, originalname, mimetype }) => {
        try {
          const ignoredHeaders = await uploadTimeSeriesData({
            user,
            multiSiteUpload,
            filePath: path,
            fileName: originalname,
            siteId,
            surveyPointId,
            sourceType: sensor,
            repositories: {
              siteRepository: this.siteRepository,
              sourcesRepository: this.sourcesRepository,
              surveyPointRepository: this.surveyPointRepository,
              timeSeriesRepository: this.timeSeriesRepository,
              dataUploadsRepository: this.dataUploadsRepository,
              dataUploadsSitesRepository: this.dataUploadsSitesRepository,
            },
            failOnWarning,
            mimetype: mimetype as Mimetype,
          });
          return { file: originalname, ignoredHeaders, error: null };
        } catch (err: unknown) {
          const error = err as HttpException;
          return {
            file: originalname,
            ignoredHeaders: null,
            error: error.message,
          };
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

  getSampleUploadFiles(surveyPointDataRangeDto: SampleUploadFilesDto) {
    const { source } = surveyPointDataRangeDto;

    switch (source) {
      case SourceType.HOBO:
        return createReadStream(
          join(process.cwd(), 'src/utils/uploads/hobo_data.csv'),
        );
      case SourceType.METLOG:
        return createReadStream(
          join(process.cwd(), 'src/utils/uploads/metlog_data_simple.csv'),
        );
      case SourceType.SONDE:
        return createReadStream(
          join(process.cwd(), 'src/utils/uploads/sonde_data_simple.csv'),
        );
      case SourceType.HUI:
        return createReadStream(
          join(process.cwd(), 'src/utils/uploads/hui_data.csv'),
        );
      default:
        throw new NotFoundException(
          `Example upload file for source ${source} not found`,
        );
    }
  }
}
