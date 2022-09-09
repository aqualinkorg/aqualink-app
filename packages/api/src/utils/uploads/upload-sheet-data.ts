/* eslint-disable no-console */
/* eslint-disable no-plusplus */
import { chunk, first, get, isNaN, maxBy, minBy, uniqBy } from 'lodash';
import md5Fle from 'md5-file';
import { Repository } from 'typeorm';
import { BadRequestException, ConflictException, Logger } from '@nestjs/common';
import xlsx from 'node-xlsx';
import Bluebird from 'bluebird';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { Site } from '../../sites/sites.entity';
import { SiteSurveyPoint } from '../../site-survey-points/site-survey-points.entity';
import { Metric } from '../../time-series/metrics.entity';
import { TimeSeries } from '../../time-series/time-series.entity';
import { Sources } from '../../sites/sources.entity';
import { SourceType } from '../../sites/schemas/source-type.enum';
import { DataUploads } from '../../data-uploads/data-uploads.entity';
import { getSite } from '../site.utils';
import { GoogleCloudService } from '../../google-cloud/google-cloud.service';

interface Repositories {
  siteRepository: Repository<Site>;
  surveyPointRepository: Repository<SiteSurveyPoint>;
  timeSeriesRepository: Repository<TimeSeries>;
  sourcesRepository: Repository<Sources>;
  dataUploadsRepository: Repository<DataUploads>;
}

const logger = new Logger('ParseSondeData');

const ACCEPTED_FILE_TYPES = [
  {
    extension: 'xlsx',
    mimetype:
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  },
  {
    extension: 'csv',
    mimetype: 'text/csv',
  },
  {
    extension: 'xls',
    mimetype: 'application/vnd.ms-excel',
  },
] as const;
const TIMEZONE_REGEX = /[+-]\d{1,2}:?\d{0,2}\b/;
const SECONDS_IN_DAY = 24 * 60 * 60;
const MISSING_LEAP_YEAR_DAY = SECONDS_IN_DAY * 1000;
const MAGIC_NUMBER_OF_DAYS = 25569;
const MAGIC_NUMBER_OF_MINUTES = 1440;

type TimeType = 'Time' | 'Date' | 'Timestamp';

interface SourceItem {
  metric?: Metric;
  time?: TimeType;
  ignore?: boolean;
  convertFn?: (arg: number) => number;
}

const sourceItems: Record<SourceType, Record<string, SourceItem>> = {
  [SourceType.SONDE]: {
    Date: { time: 'Date', ignore: true },
    Time: { time: 'Time', ignore: true },
    'Time (Fract. Sec)': { ignore: true },
    'Site Name': { ignore: true },
    'Chlorophyll RFU': { metric: Metric.CHOLOROPHYLL_RFU },
    'Chlorophyll ug/L': { metric: Metric.CHOLOROPHYLL_CONCENTRATION },
    'Cond µS/cm': { metric: Metric.CONDUCTIVITY },
    'Depth m': { metric: Metric.WATER_DEPTH },
    'ODO % sat': { metric: Metric.ODO_SATURATION },
    'ODO mg/L': { metric: Metric.ODO_CONCENTRATION },
    'Sal psu': { metric: Metric.SALINITY },
    'SpCond µS/cm': { metric: Metric.SPECIFIC_CONDUCTANCE },
    'TDS mg/L': { metric: Metric.TDS },
    'Turbidity FNU': { metric: Metric.TURBIDITY },
    'TSS mg/L': { metric: Metric.TOTAL_SUSPENDED_SOLIDS },
    'Wiper Position volt': { metric: Metric.SONDE_WIPER_POSITION },
    pH: { metric: Metric.PH },
    'pH mV': { metric: Metric.PH_MV },
    'Temp °C': { metric: Metric.BOTTOM_TEMPERATURE },
    'Battery V': { metric: Metric.SONDE_BATTERY_VOLTAGE },
    'Cable Pwr V': { metric: Metric.SONDE_CABLE_POWER_VOLTAGE },
    Temp: { metric: Metric.BOTTOM_TEMPERATURE },
    Salinity: { metric: Metric.SALINITY },
    DO: { metric: Metric.ODO_CONCENTRATION },
    DO_sat: { metric: Metric.ODO_SATURATION },
    Turbidity: { metric: Metric.TURBIDITY },
    TotalN: { metric: Metric.NITROGEN_TOTAL },
    TotalP: { metric: Metric.PHOSPHORUS_TOTAL },
    Phosphate: { metric: Metric.PHOSPHORUS },
    Silicate: { metric: Metric.SILICATE },
    NNN: { metric: Metric.NNN },
    NH4: { metric: Metric.AMMONIUM },
  },
  [SourceType.METLOG]: {
    '#': { ignore: true },
    'Date Time': { time: 'Timestamp', ignore: true },
    'Pressure, mbar': { metric: Metric.PRESSURE },
    'Rain, mm': { metric: Metric.PRECIPITATION },
    'Temp, °C': { metric: Metric.AIR_TEMPERATURE },
    'RH, %': { metric: Metric.RH },
    'Wind Speed, m/s': { metric: Metric.WIND_SPEED },
    'Gust Speed, m/s': { metric: Metric.WIND_GUST_SPEED },
    'Wind Direction, ø': { metric: Metric.WIND_DIRECTION },
  },
  [SourceType.HOBO]: {
    '': { ignore: true },
    'ï..Col': { ignore: true },
    'X.': { ignore: true },
    Date_Time: { ignore: true, time: 'Timestamp' },
    Temp: { metric: Metric.BOTTOM_TEMPERATURE },
    Date: { ignore: true },
    Time: { ignore: true },
    Time_zone: { ignore: true },
  },
  [SourceType.NOAA]: {},
  [SourceType.GFS]: {},
  [SourceType.SPOTTER]: {},
  [SourceType.SOFAR_WAVE_MODEL]: {},
  [SourceType.HUI]: {
    '': { ignore: true },
    SampleID: { ignore: true },
    SiteName: { ignore: true },
    Station: { ignore: true },
    Session: { ignore: true },
    Date: { time: 'Date', ignore: true },
    Time: { time: 'Time', ignore: true },
    Temp: { metric: Metric.BOTTOM_TEMPERATURE },
    Salinity: { metric: Metric.SALINITY },
    DO: { metric: Metric.ODO_CONCENTRATION },
    DO_sat: { metric: Metric.ODO_SATURATION },
    pH: { metric: Metric.PH },
    Turbidity: { metric: Metric.TURBIDITY },
    TotalN: { metric: Metric.NITROGEN_TOTAL },
    TotalP: { metric: Metric.PHOSPHORUS_TOTAL },
    Phosphate: { metric: Metric.PHOSPHORUS },
    Silicate: { metric: Metric.SILICATE },
    NNN: { metric: Metric.NNN },
    NH4: { metric: Metric.AMMONIUM },
    Lat: { ignore: true },
    Long: { ignore: true },
    'QA issues or comments': { ignore: true },
  },
};

export type Mimetype = typeof ACCEPTED_FILE_TYPES[number]['mimetype'];
export type Extension = typeof ACCEPTED_FILE_TYPES[number]['extension'];

export const fileFilter: MulterOptions['fileFilter'] = (
  _,
  { mimetype: inputMimetype },
  callback,
) => {
  if (
    !ACCEPTED_FILE_TYPES.map(({ mimetype }) => mimetype as string).includes(
      inputMimetype,
    )
  ) {
    callback(
      new BadRequestException(
        `Only ${ACCEPTED_FILE_TYPES.map(
          ({ extension }) => `.${extension}`,
        ).join(', ')} files are accepted`,
      ),
      false,
    );
  }
  callback(null, true);
};

const headerMatchesKey = (header: string, key: string) =>
  header.toLowerCase().startsWith(key.toLowerCase());

async function refreshMaterializedView(repositories: Repositories) {
  const hash = (Math.random() + 1).toString(36).substring(7);
  console.time(`Refresh Materialized View ${hash}`);
  await repositories.dataUploadsRepository.query(
    'REFRESH MATERIALIZED VIEW latest_data',
  );
  console.timeEnd(`Refresh Materialized View ${hash}`);
}

const getJsDateFromExcel = (item, index, timezone) => {
  if (Array.isArray(index)) {
    const excelDate = item[index[0]];
    const excelTime = item[index[1]];

    const delta = excelDate - MAGIC_NUMBER_OF_DAYS;
    const parsed = delta * MISSING_LEAP_YEAR_DAY;
    const minutes = excelTime * MAGIC_NUMBER_OF_MINUTES;

    const date = new Date(parsed);
    date.setMinutes(minutes);

    return date;
  }
  const excelDate = item[index];
  const delta = excelDate - MAGIC_NUMBER_OF_DAYS;
  const parsed = delta * MISSING_LEAP_YEAR_DAY;

  if (timezone) {
    return new Date(`${parsed} GMT ${timezone}`);
  }

  return new Date(parsed);
};

const getTimeStamp = (
  index: number | number[],
  item: any[],
  extension?: Extension,
  timezone?: string,
) => {
  const isArray = Array.isArray(index);
  if (isArray && extension === 'csv')
    return new Date(`${item[index[0]]} ${item[index[1]]}`);
  if (!isArray && extension === 'csv' && timezone)
    return new Date(`${item[index]} GMT ${timezone}`);
  if (!isArray && extension === 'csv' && !timezone)
    return new Date(item[index]);
  return getJsDateFromExcel(item, index, timezone);
};

const findTimeStampIndex = (
  type: SourceType,
  headers: string[],
): number | number[] => {
  const findKey = (key) =>
    first(
      Object.entries(sourceItems[type]).find(([, value]) => value.time === key),
    );

  const timestampKey = findKey('Timestamp');

  if (timestampKey) {
    const timestampIndex = headers.findIndex((item) =>
      item?.includes(timestampKey as string),
    );

    if (timestampIndex !== -1) return timestampIndex;
  }

  const timeKey = findKey('Time');
  const dateKey = findKey('Date');

  const timeIndex = headers.findIndex((item) =>
    item?.includes(timeKey as string),
  );

  const dateIndex = headers.findIndex((item) =>
    item?.includes(dateKey as string),
  );

  if (timeIndex === -1 || dateIndex === -1) {
    throw new BadRequestException('Not current timestamp schema');
  }

  return [dateIndex, timeIndex];
};

export const getFilePathData = async (
  filePath: string,
  sourceType: SourceType,
) => {
  const workSheetsFromFile = xlsx.parse(filePath, { raw: true });
  const workSheetData = workSheetsFromFile[0]?.data;

  const headerIndex = workSheetData?.findIndex((row) =>
    Object.keys(sourceItems[sourceType]).some((key) =>
      row.some((cell) => {
        return typeof cell === 'string' && headerMatchesKey(cell, key);
      }),
    ),
  );

  const headers = workSheetData[headerIndex] as string[];

  const { ignoredHeaders, importedHeaders } = Object.keys(
    sourceItems[sourceType],
  ).reduce<{
    ignoredHeaders: string[];
    importedHeaders: Metric[];
  }>(
    (res, x) => {
      if (sourceItems[sourceType][x]?.ignore) {
        // eslint-disable-next-line fp/no-mutating-methods
        res.ignoredHeaders.push(x);
      } else {
        // eslint-disable-next-line fp/no-mutating-methods
        res.importedHeaders.push(sourceItems[sourceType][x].metric as Metric);
      }
      return res;
    },
    { ignoredHeaders: [], importedHeaders: [] },
  );

  const signature = await md5Fle(filePath);

  return {
    workSheetData,
    signature,
    ignoredHeaders,
    importedHeaders,
    headers,
    headerIndex,
  };
};

export const convertData = (
  workSheetData: any[][],
  headers: string[],
  headerIndex: number,
  sourceType: SourceType,
  ignoredHeaders: string[],
  fileName: string,
  sourceEntity: Sources,
) => {
  const preResult: any[] = workSheetData?.slice(headerIndex + 1);
  const extension = fileName.split('.')[1] as Extension;

  const timestampIndex = findTimeStampIndex(sourceType, headers);

  console.time(`Get data from sheet ${fileName}`);
  const results = preResult.map((item) => {
    const tempData = Object.keys(sourceItems[sourceType])
      .map((header) => {
        if (ignoredHeaders.includes(header) || !headers.includes(header)) {
          return [];
        }

        const index = headers.findIndex((h) => h === header);

        const columnName = sourceItems[sourceType][header].metric;
        const convertFn = sourceItems[sourceType][header]?.convertFn;
        const value = !convertFn
          ? item[index]
          : convertFn(parseFloat(item[index])).toFixed(2);

        return [columnName, value];
      })
      .filter((filtered) => filtered.length);

    const timezone =
      typeof timestampIndex === 'number'
        ? first(headers[timestampIndex].match(TIMEZONE_REGEX))
        : undefined;

    const timestamp = getTimeStamp(timestampIndex, item, extension, timezone);

    // eslint-disable-next-line fp/no-mutating-methods
    tempData.push(['timestamp', timestamp]);

    return Object.fromEntries(tempData);
  });
  console.timeEnd(`Get data from sheet ${fileName}`);

  console.time(`Remove duplicates and empty values ${fileName}`);
  const data = uniqBy(
    results
      .reduce((timeSeriesObjects: any[], object) => {
        const { timestamp } = object;
        return [
          ...timeSeriesObjects,
          ...Object.keys(object)
            .filter((k) => k !== 'timestamp')
            .map((key) => {
              return {
                timestamp,
                value: parseFloat(object[key]),
                metric: key,
                source: sourceEntity,
              };
            }),
        ];
      }, [])
      .filter((valueObject) => {
        if (!isNaN(parseFloat(valueObject.value))) {
          return true;
        }
        // logger.log('Excluding incompatible value:');
        // logger.log(valueObject);
        return false;
      }),
    ({ timestamp, metric, source }) => `${timestamp}, ${metric}, ${source.id}`,
  );
  console.timeEnd(`Remove duplicates and empty values ${fileName}`);
  return data;
};

export const uploadTimeSeriesData = async (
  filePath: string,
  fileName: string,
  siteId: string,
  surveyPointId: string | undefined,
  sourceType: SourceType,
  repositories: Repositories,
  failOnWarning?: boolean,
) => {
  if (!Object.keys(sourceItems[sourceType]).length) {
    throw new BadRequestException('Schema not provided for this type yet');
  }
  // // TODO
  // // - Add foreign key constraint to sources on site_id
  console.time(`Upload datafile ${fileName}`);

  const [existingSourceEntity, site, surveyPoint] = await Promise.all([
    repositories.sourcesRepository.findOne({
      relations: ['surveyPoint', 'site'],
      where: {
        site: { id: siteId },
        surveyPoint: surveyPointId || null,
        type: sourceType,
      },
    }),
    getSite(parseInt(siteId, 10), repositories.siteRepository),
    surveyPointId
      ? repositories.surveyPointRepository.findOne(parseInt(surveyPointId, 10))
      : undefined,
  ]);

  const sourceEntity =
    existingSourceEntity ||
    (await repositories.sourcesRepository.save({
      type: sourceType,
      site,
      surveyPoint,
    }));

  if (Object.keys(sourceItems).includes(sourceType)) {
    const {
      workSheetData,
      signature,
      ignoredHeaders,
      importedHeaders,
      headers,
      headerIndex,
    } = await getFilePathData(filePath, sourceType);

    if (failOnWarning && ignoredHeaders.length > 0) {
      throw new BadRequestException(
        `${fileName}: The columns ${ignoredHeaders
          .map((header) => `"${header}"`)
          .join(
            ', ',
          )} are not configured for import yet and cannot be uploaded.`,
      );
    }

    const uploadExists = await repositories.dataUploadsRepository.findOne({
      where: {
        signature,
        site,
        surveyPoint,
        sensorType: sourceType,
      },
    });

    if (uploadExists) {
      throw new ConflictException(
        `${fileName}: A file upload named '${uploadExists.file}' with the same data already exists`,
      );
    }

    const data = convertData(
      workSheetData,
      headers,
      headerIndex,
      sourceType,
      ignoredHeaders,
      fileName,
      sourceEntity,
    );

    const minDate = get(
      minBy(data, (item) => new Date(get(item, 'timestamp')).getTime()),
      'timestamp',
    );
    const maxDate = get(
      maxBy(data, (item) => new Date(get(item, 'timestamp')).getTime()),
      'timestamp',
    );

    // Initialize google cloud service, to be used for media upload
    const googleCloudService = new GoogleCloudService();

    // Note this may fail. It would still return a location, but the file may not have been uploaded
    const fileLocation = googleCloudService.uploadFileAsync(
      filePath,
      sourceType,
      'data_uploads',
      'data_upload',
    );

    const dataUploadsFile = await repositories.dataUploadsRepository.save({
      file: fileName,
      signature,
      sensorType: sourceType,
      site,
      surveyPoint,
      minDate,
      maxDate,
      metrics: importedHeaders,
      fileLocation,
    });

    const dataAsTimeSeries = data.map((x: any) => {
      return {
        timestamp: x.timestamp,
        value: x.value,
        metric: x.metric,
        source: x.source,
        dataUpload: dataUploadsFile,
      };
    });

    // Data is too big to added with one bulk insert so we batch the upload.
    console.time(`Loading into DB ${fileName}`);
    const batchSize = 100;
    logger.log(`Saving time series data in batches of ${batchSize}`);
    const inserts = chunk(dataAsTimeSeries, batchSize).map(
      async (batch: any[]) => {
        try {
          await repositories.timeSeriesRepository
            .createQueryBuilder('time_series')
            .insert()
            .values(batch)
            // If there's a conflict, replace data with the new value.
            // onConflict is deprecated, but updating it is tricky.
            // See https://github.com/typeorm/typeorm/issues/8731?fbclid=IwAR2Obg9eObtGNRXaFrtKvkvvVSWfvjtHpFu-VEM47yg89SZcPpxEcZOmcLw
            .onConflict(
              'ON CONSTRAINT "no_duplicate_data" DO UPDATE SET "value" = excluded.value',
            )
            .execute();
        } catch {
          console.warn('The following batch failed to upload:\n', batch);
        }
        return true;
      },
    );

    // Return insert promises and print progress updates
    const actionsLength = inserts.length;
    await Bluebird.Promise.each(inserts, (props, idx) => {
      logger.log(`Saved ${idx + 1} out of ${actionsLength} batches`);
    });
    console.timeEnd(`Loading into DB ${fileName}`);
    logger.log('loading complete');

    refreshMaterializedView(repositories);

    console.timeEnd(`Upload datafile ${fileName}`);
    return ignoredHeaders;
  }

  return [];
};
