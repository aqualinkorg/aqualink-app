/* eslint-disable no-console */
/* eslint-disable no-plusplus */
import {
  chunk,
  first,
  get,
  groupBy,
  isNaN,
  maxBy,
  minBy,
  uniqBy,
} from 'lodash';
import md5Fle from 'md5-file';
import { Repository } from 'typeorm';
import { BadRequestException, Logger } from '@nestjs/common';
import xlsx from 'node-xlsx';
import Bluebird from 'bluebird';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { Site } from '../../sites/sites.entity';
import { SiteSurveyPoint } from '../../site-survey-points/site-survey-points.entity';
import { Metric } from '../../time-series/metrics.entity';
import { TimeSeries } from '../../time-series/time-series.entity';
import { Sources } from '../../sites/sources.entity';
import { SourceType } from '../../sites/schemas/source-type.enum';
import { DataUploads } from '../../data-uploads/data-uploads.entity';
import { getSite } from '../site.utils';
import { GoogleCloudService } from '../../google-cloud/google-cloud.service';
import { getBarometricDiff } from '../sofar';
import { refreshMaterializedView } from '../time-series.utils';

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

type TimeType = 'Time' | 'Date' | 'Timestamp';

interface SourceItem {
  metric?: Metric;
  time?: TimeType;
  ignore?: boolean;
  convertFn?: (arg: number) => number;
}

const sourceItems: Record<SourceType, Record<string, SourceItem>> = {
  [SourceType.SONDE]: {
    'Date (MM/DD/YYYY)': { time: 'Date', ignore: true },
    'Time (HH:mm:ss)': { time: 'Time', ignore: true },
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
  },
};

export type Mimetype = typeof ACCEPTED_FILE_TYPES[number]['mimetype'];

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

const getJsDateFromExcel = (excelDate, timezone) => {
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
  mimetype?: Mimetype,
  timezone?: string,
) => {
  const isArray = Array.isArray(index);
  if (
    isArray &&
    typeof item[index[0]] === 'string' &&
    typeof item[index[1]] === 'string'
  )
    return new Date(`${item[index[0]]} ${item[index[1]]}`);
  if (isArray) {
    const date = new Date(Date.UTC(1900, 0, 1));
    date.setDate(item[index[0]] || 0);
    date.setUTCHours(0);
    date.setUTCMinutes(0);
    date.setUTCSeconds(0);
    date.setSeconds(Math.round(SECONDS_IN_DAY * (item[index[1]] || 0)));
    return date;
  }
  if (!isArray && mimetype === 'text/csv' && timezone)
    return new Date(`${item[index]} GMT ${timezone}`);
  if (!isArray && mimetype === 'text/csv' && !timezone)
    return new Date(item[index]);
  return getJsDateFromExcel(item[index], timezone);
};

const findTimeStampIndex = (type: SourceType): number | number[] => {
  const timestampIndex = Object.values(sourceItems[type]).findIndex(
    (item) => item.time === 'Timestamp',
  );

  if (timestampIndex !== -1) return timestampIndex;

  const timeIndex = Object.values(sourceItems[type]).findIndex(
    (item) => item.time === 'Time',
  );
  const dateIndex = Object.values(sourceItems[type]).findIndex(
    (item) => item.time === 'Date',
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
  mimetype?: Mimetype,
) => {
  const preResult = workSheetData
    ?.slice(headerIndex + 1)
    .map((item) => {
      if (item.length === headers.length) return item as string[];
      return undefined;
    })
    .filter((item) => item) as string[][];

  const timestampIndex = findTimeStampIndex(sourceType);

  console.time(`Get data from sheet ${fileName}`);
  const results = preResult.map((item) => {
    const tempData: ([Metric, string] | ['timestamp', Date])[] = Object.keys(
      sourceItems[sourceType],
    )
      .map<[Metric | undefined, string]>((header, i) => {
        if (ignoredHeaders.includes(header)) {
          return [undefined, ''];
        }

        const columnName = sourceItems[sourceType][header].metric;
        const convertFn = sourceItems[sourceType][header]?.convertFn;
        const value = !convertFn
          ? item[i]
          : convertFn(parseFloat(item[i])).toFixed(2);

        return [columnName, value];
      })
      .filter<[Metric, string]>(
        (filtered): filtered is [Metric, string] => filtered[0] !== undefined,
      );

    const timezone =
      typeof timestampIndex === 'number'
        ? first(headers[timestampIndex].match(TIMEZONE_REGEX))
        : undefined;

    const timestamp = getTimeStamp(timestampIndex, item, mimetype, timezone);

    // eslint-disable-next-line fp/no-mutating-methods
    tempData.push(['timestamp', timestamp]);

    return Object.fromEntries(tempData);
  });
  console.timeEnd(`Get data from sheet ${fileName}`);

  console.time(`Remove duplicates and empty values ${fileName}`);
  const data = uniqBy(
    results
      .reduce<
        {
          timestamp: string;
          value: number;
          metric: string;
          source: Sources;
        }[]
      >((timeSeriesObjects: any[], object) => {
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
        if (!isNaN(valueObject.value)) {
          return true;
        }
        logger.log('Excluding incompatible value:');
        logger.log(valueObject);
        return false;
      }),
    ({ timestamp, metric, source }) => `${timestamp}, ${metric}, ${source.id}`,
  );
  console.timeEnd(`Remove duplicates and empty values ${fileName}`);
  return data;
};

export const uploadFileToGCloud = async (
  dataUploadsRepository: Repository<DataUploads>,
  signature: string,
  site: Site | undefined,
  surveyPoint: SiteSurveyPoint | undefined,
  sourceType: SourceType,
  fileName: string,
  filePath: string,
  minDate: string | undefined,
  maxDate: string | undefined,
  importedHeaders: Metric[],
) => {
  logger.warn(`Uploading file to google cloud: ${fileName}`);
  const uploadExists = await dataUploadsRepository.findOne({
    where: {
      signature,
    },
  });

  if (uploadExists) {
    Logger.warn(
      `${fileName}: A file upload named '${uploadExists.file}' with the same data already exists`,
    );
    return uploadExists;
  }
  // Initialize google cloud service, to be used for media upload
  const googleCloudService = new GoogleCloudService();

  // Note this may fail. It would still return a location, but the file may not have been uploaded
  const fileLocation = googleCloudService.uploadFileAsync(
    filePath,
    sourceType,
    'data_uploads',
    'data_upload',
  );

  const dataUploadsFile = await dataUploadsRepository.save({
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

  return dataUploadsFile;
};

export const findOrCreateSourceEntity = async (
  site: Site,
  sourceType: SourceType,
  surveyPoint: SiteSurveyPoint | null,
  sourcesRepository: Repository<Sources>,
) => {
  const existingSourceEntity = await sourcesRepository.findOne({
    relations: ['surveyPoint', 'site'],
    where: {
      site,
      surveyPoint,
      type: sourceType,
    },
  });
  const sourceEntity =
    existingSourceEntity ||
    (await sourcesRepository.save({
      type: sourceType,
      site,
      surveyPoint,
    }));
  return sourceEntity;
};

export const saveBatchToTimeSeries = (
  data: QueryDeepPartialEntity<TimeSeries>[],
  timeSeriesRepository: Repository<TimeSeries>,
  batchSize = 100,
) => {
  logger.log(`Saving time series data in batches of ${batchSize}`);
  const inserts = chunk(data, batchSize).map(async (batch: any[]) => {
    try {
      await timeSeriesRepository
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
  });

  // Return insert promises and print progress updates
  const actionsLength = inserts.length;
  return Bluebird.Promise.each(inserts, (props, idx) => {
    logger.log(`Saved ${idx + 1} out of ${actionsLength} batches`);
  });
};

export const uploadTimeSeriesData = async (
  filePath: string,
  fileName: string,
  siteId: string,
  surveyPointId: string | undefined,
  sourceType: SourceType,
  repositories: Repositories,
  failOnWarning?: boolean,
  mimetype?: Mimetype,
) => {
  if (!Object.keys(sourceItems[sourceType]).length) {
    throw new BadRequestException('Schema not provided for this type yet');
  }
  // // TODO
  // // - Add foreign key constraint to sources on site_id
  console.time(`Upload datafile ${fileName}`);

  const [site, surveyPoint] = await Promise.all([
    getSite(parseInt(siteId, 10), repositories.siteRepository),
    surveyPointId
      ? repositories.surveyPointRepository.findOne(parseInt(surveyPointId, 10))
      : undefined,
  ]);

  const sourceEntity = await findOrCreateSourceEntity(
    site,
    sourceType,
    surveyPoint || null,
    repositories.sourcesRepository,
  );

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

    const data = convertData(
      workSheetData,
      headers,
      headerIndex,
      sourceType,
      ignoredHeaders,
      fileName,
      sourceEntity,
      mimetype,
    );

    const minDate = get(
      minBy(data, (item) => new Date(get(item, 'timestamp')).getTime()),
      'timestamp',
    );
    const maxDate = get(
      maxBy(data, (item) => new Date(get(item, 'timestamp')).getTime()),
      'timestamp',
    );

    const dataUploadsFile = await uploadFileToGCloud(
      repositories.dataUploadsRepository,
      signature,
      site,
      surveyPoint,
      sourceType,
      fileName,
      filePath,
      minDate,
      maxDate,
      importedHeaders,
    );

    const dataAsTimeSeriesNoDiffs = data.map((x) => {
      return {
        timestamp: x.timestamp,
        value: x.value,
        metric: x.metric,
        source: x.source,
        dataUpload: dataUploadsFile,
      };
    });

    const barometricPressures = dataAsTimeSeriesNoDiffs.filter(
      (x) => x.metric === Metric.BAROMETRIC_PRESSURE_TOP,
    );
    const pressuresBySource = groupBy(barometricPressures, 'source.site.id');

    const barometricDiffs = Object.entries(pressuresBySource).map(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      ([key, pressures]) => {
        // eslint-disable-next-line fp/no-mutating-methods
        const sortedPressures = pressures.sort((a, b) => {
          if (a.timestamp > b.timestamp) return 1;
          if (a.timestamp < b.timestamp) return -1;
          return 0;
        });
        const valueDiff = getBarometricDiff(sortedPressures);
        return valueDiff !== null
          ? {
              timestamp: valueDiff.timestamp,
              value: valueDiff.value,
              metric: Metric.BAROMETRIC_PRESSURE_TOP_DIFF,
              source: sortedPressures[1].source,
              dataUpload: dataUploadsFile,
            }
          : undefined;
      },
    );

    const filteredDiffs = barometricDiffs.filter((x) => x !== undefined);

    const dataAsTimeSeries = [...dataAsTimeSeriesNoDiffs, filteredDiffs];

    // Data is too big to added with one bulk insert so we batch the upload.
    console.time(`Loading into DB ${fileName}`);
    await saveBatchToTimeSeries(
      dataAsTimeSeries as QueryDeepPartialEntity<TimeSeries>[],
      repositories.timeSeriesRepository,
    );
    console.timeEnd(`Loading into DB ${fileName}`);
    logger.log('loading complete');

    refreshMaterializedView(repositories.dataUploadsRepository);

    console.timeEnd(`Upload datafile ${fileName}`);
    return ignoredHeaders;
  }

  return [];
};
