import { InjectRepository } from '@nestjs/typeorm';
import {
  closeSync,
  createReadStream,
  openSync,
  unlinkSync,
  writeSync,
} from 'fs';
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
import { DateTime } from 'luxon';
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
  getAvailableMetricsQuery,
  getAvailableDataDates,
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

    const uniqueMetrics = await getAvailableMetricsQuery({
      timeSeriesRepository: this.timeSeriesRepository,
      siteId,
      start: startDate,
      end: endDate,
      metrics,
    });

    const headerKeys = [
      'timestamp',
      ...uniqueMetrics.map((x) => `${x.metric}_${x.source}`),
    ];

    const emptyRow = Object.fromEntries(
      headerKeys.map((x) => [x, undefined]),
    ) as {
      [k: string]: any;
    };

    const { min, max } = (await getAvailableDataDates({
      timeSeriesRepository: this.timeSeriesRepository,
      siteId,
      metrics,
    })) || { min: new Date(), max: new Date() };

    const minDate = DateTime.fromISO(startDate || min.toISOString()).startOf(
      'hour',
    );
    const maxDate = DateTime.fromISO(endDate || max.toISOString()).startOf(
      'hour',
    );

    const monthChunkSize = 6;

    const createChunks = (
      curr: DateTime,
      acc: { start: DateTime; end: DateTime }[],
    ): { start: DateTime; end: DateTime }[] => {
      if (curr.diff(minDate, 'months').months < monthChunkSize)
        return [
          ...acc,
          { end: curr.minus({ milliseconds: 1 }), start: minDate },
        ];

      const next = curr.minus({ months: monthChunkSize });
      const item = { end: curr.minus({ milliseconds: 1 }), start: next };

      return createChunks(next, [...acc, item]);
    };

    const chunks = createChunks(maxDate, []);

    const tempFileName = join(
      process.cwd(),
      Math.random().toString(36).substring(2, 15),
    );

    const fd = openSync(tempFileName, 'w');

    try {
      // eslint-disable-next-line fp/no-mutation, no-plusplus
      for (let i = 0; i < chunks.length; i++) {
        const first = i === 0;

        // we want this not to run in parallel, that's why it is ok here to disable no-await-in-loop
        // eslint-disable-next-line no-await-in-loop
        const data: TimeSeriesData[] = await getDataQuery({
          timeSeriesRepository: this.timeSeriesRepository,
          siteId,
          metrics,
          start: chunks[i].start.toISO() as string,
          end: chunks[i].end.toISO() as string,
          hourly,
          csv: true,
          order: 'DESC',
        });

        const metricSourceAsKey = data.map((x) => ({
          key: `${x.metric}_${x.source}`,
          value: x.value,
          timestamp: x.timestamp,
        }));

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

        const rows = Object.entries(groupedByTimestamp).map(
          ([timestamp, values]) =>
            values.reduce((acc, curr) => {
              // eslint-disable-next-line fp/no-mutation
              acc[curr.key] = curr.value;
              // eslint-disable-next-line fp/no-mutation
              acc.timestamp = timestamp;
              return acc;
            }, structuredClone(emptyRow)),
        );

        const csvLines = stringify(rows, { header: first });

        writeSync(fd, csvLines);
      }

      closeSync(fd);

      const fileName = `data_site_${siteId}_${moment(startDate).format(
        DATE_FORMAT,
      )}_${moment(endDate).format(DATE_FORMAT)}.csv`;

      const readStream = createReadStream(tempFileName);

      res.set({
        'Content-Disposition': `attachment; filename=${encodeURIComponent(
          fileName,
        )}`,
      });

      readStream.pipe(res);

      readStream.on('end', () => {
        unlinkSync(tempFileName);
      });
    } catch (error) {
      console.error(error);
      unlinkSync(tempFileName);
    }
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
    sensor: SourceType = SourceType.SHEET_DATA,
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
            mimetype as Mimetype,
          );
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
