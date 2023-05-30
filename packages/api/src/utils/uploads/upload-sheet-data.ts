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
import { TimeSeries } from '../../time-series/time-series.entity';
import { Sources } from '../../sites/sources.entity';
import { SourceType } from '../../sites/schemas/source-type.enum';
import { DataUploads } from '../../data-uploads/data-uploads.entity';
import { getSite } from '../site.utils';
import { GoogleCloudService } from '../../google-cloud/google-cloud.service';
import { getBarometricDiff } from '../sofar';
import { refreshMaterializedView } from '../time-series.utils';
import { Metric } from '../../time-series/metrics.enum';

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

interface Data {
  timestamp: string;
  value: number;
  metric: Metric;
  source: Sources;
}

const nonMetric = ['date', 'time', 'timestamp'] as const;

type NonMetric = typeof nonMetric[number];

type Token = Metric | NonMetric;

interface Rule {
  token: Token;
  expression: RegExp;
}

const rules: Rule[] = [
  // Non Metrics
  { token: 'date', expression: /^(Date \(MM\/DD\/YYYY\)|Date)$/ },
  { token: 'time', expression: /^(Time \(HH:mm:ss\)|Time)$/ },
  { token: 'timestamp', expression: /^(Date Time|Date_Time)$/ },
  // Default Metrics
  // should match 'Temp, °C'
  { token: Metric.AIR_TEMPERATURE, expression: /^Temp, .*C$/ },
  // should match 'Temp °C'
  { token: Metric.BOTTOM_TEMPERATURE, expression: /^(Temp .*C|Temp)$/ },
  { token: Metric.WIND_SPEED, expression: /^Wind Speed, m\/s$/ },
  // should match 'Wind Direction, ø'
  { token: Metric.WIND_DIRECTION, expression: /^Wind Direction, .*$/ },
  // Sonde Metrics
  { token: Metric.CHOLOROPHYLL_RFU, expression: /^Chlorophyll RFU$/ },
  {
    token: Metric.CHOLOROPHYLL_CONCENTRATION,
    expression: /^Chlorophyll ug\/L$/,
  },
  // should match 'Cond µS/cm'
  { token: Metric.CONDUCTIVITY, expression: /^Cond .*S\/cm$/ },
  { token: Metric.WATER_DEPTH, expression: /^Depth m$/ },
  { token: Metric.ODO_SATURATION, expression: /^(ODO % sat|DO_sat)$/ },
  { token: Metric.ODO_CONCENTRATION, expression: /^(ODO mg\/L|DO)$/ },
  { token: Metric.SALINITY, expression: /^(Sal psu|Salinity)$/ },
  // should match 'SpCond µS/cm'
  { token: Metric.SPECIFIC_CONDUCTANCE, expression: /^SpCond .*S\/cm$/ },
  { token: Metric.TDS, expression: /^TDS mg\/L$/ },
  { token: Metric.TURBIDITY, expression: /^(Turbidity FNU|Turbidity)$/ },
  { token: Metric.TOTAL_SUSPENDED_SOLIDS, expression: /^TSS mg\/L$/ },
  { token: Metric.SONDE_WIPER_POSITION, expression: /^Wiper Position volt$/ },
  { token: Metric.PH, expression: /^pH$/ },
  { token: Metric.PH_MV, expression: /^pH mV$/ },
  { token: Metric.SONDE_BATTERY_VOLTAGE, expression: /^Battery V$/ },
  { token: Metric.SONDE_CABLE_POWER_VOLTAGE, expression: /^Cable Pwr V$/ },
  { token: Metric.PRESSURE, expression: /^Pressure, mbar$/ },
  { token: Metric.PRECIPITATION, expression: /^Rain, mm$/ },
  { token: Metric.RH, expression: /^RH, %$/ },
  { token: Metric.WIND_GUST_SPEED, expression: /^Gust Speed, m\/s$/ },
  // HUI Metrics
  { token: Metric.NITROGEN_TOTAL, expression: /^TotalN$/ },
  { token: Metric.PHOSPHORUS_TOTAL, expression: /^TotalP$/ },
  { token: Metric.PHOSPHORUS, expression: /^Phosphate$/ },
  { token: Metric.SILICATE, expression: /^Silicate$/ },
  { token: Metric.NNN, expression: /^NNN$/ },
  { token: Metric.AMMONIUM, expression: /^NH4$/ },
];

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

const findTimeStampIndex = (
  headerToTokenMap: (Token | undefined)[],
): number | number[] => {
  const timestampIndex = headerToTokenMap.findIndex((x) => x === 'timestamp');

  if (timestampIndex !== -1) return timestampIndex;

  const timeIndex = headerToTokenMap.findIndex((x) => x === 'time');
  const dateIndex = headerToTokenMap.findIndex((x) => x === 'date');

  if (timeIndex === -1 || dateIndex === -1) {
    throw new BadRequestException('Not current timestamp schema');
  }
  return [dateIndex, timeIndex];
};

export const getFilePathData = async (filePath: string) => {
  const workSheetsFromFile = xlsx.parse(filePath, { raw: true });
  const workSheetData = workSheetsFromFile[0]?.data;

  const headerIndex = workSheetData?.findIndex((row) =>
    rules.some((rule) =>
      row.some(
        (cell) => typeof cell === 'string' && rule.expression.test(cell),
      ),
    ),
  );

  const headers = workSheetData[headerIndex] as string[];
  const headerToTokenMap: (Token | undefined)[] = headers.map(
    (x) => rules.find((rule) => rule.expression.test(x))?.token,
  );
  const importedMetrics = headerToTokenMap.filter(
    (x): x is Metric => x !== undefined && !nonMetric.includes(x as NonMetric),
  );
  const ignoredHeaders = headers.filter(
    (x, i) => headerToTokenMap[i] === undefined,
  );
  const signature = await md5Fle(filePath);

  return {
    workSheetData,
    signature,
    ignoredHeaders,
    importedMetrics,
    headers,
    headerIndex,
    headerToTokenMap,
  };
};

export const convertData = (
  workSheetData: any[][],
  headers: string[],
  headerIndex: number,
  fileName: string,
  sourceEntity: Sources,
  headerToTokenMap: (Token | undefined)[],
  mimetype?: Mimetype,
) => {
  const preResult = workSheetData
    ?.slice(headerIndex + 1)
    .map((item) => {
      if (item.length === headers.length) return item as string[];
      return undefined;
    })
    .filter((item) => item) as string[][];

  const timestampIndex = findTimeStampIndex(headerToTokenMap);

  console.time(`Get data from sheet ${fileName}`);
  const results = preResult.reduce<Data[]>((acc, row) => {
    const timezone =
      typeof timestampIndex === 'number'
        ? first(headers[timestampIndex].match(TIMEZONE_REGEX))
        : undefined;

    const timestamp = getTimeStamp(
      timestampIndex,
      row,
      mimetype,
      timezone,
    ).toISOString();

    const rowValues = row.map<Data | undefined>((cell, i) => {
      const metric = headerToTokenMap[i];
      if (metric === undefined || nonMetric.includes(metric as NonMetric)) {
        return undefined;
      }

      return {
        timestamp,
        value: parseFloat(cell),
        metric: metric as Metric,
        source: sourceEntity,
      };
    });

    const filtered = rowValues.filter((x): x is Data => x !== undefined);
    return [...acc, ...filtered];
  }, []);
  console.timeEnd(`Get data from sheet ${fileName}`);

  console.time(`Remove duplicates and empty values ${fileName}`);
  const data = uniqBy(
    results.filter((valueObject) => {
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
      site: { id: site.id },
      surveyPoint: { id: surveyPoint?.id },
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
  console.time(`Upload datafile ${fileName}`);

  const [site, surveyPoint] = await Promise.all([
    getSite(parseInt(siteId, 10), repositories.siteRepository),
    surveyPointId
      ? repositories.surveyPointRepository.findOneBy({
          id: parseInt(surveyPointId, 10),
        })
      : undefined,
  ]);

  const sourceEntity = await findOrCreateSourceEntity(
    site,
    sourceType,
    surveyPoint || null,
    repositories.sourcesRepository,
  );

  const {
    workSheetData,
    signature,
    ignoredHeaders,
    importedMetrics,
    headers,
    headerIndex,
    headerToTokenMap,
  } = await getFilePathData(filePath);

  const data = convertData(
    workSheetData,
    headers,
    headerIndex,
    fileName,
    sourceEntity,
    headerToTokenMap,
    mimetype,
  );

  if (failOnWarning && ignoredHeaders.length > 0) {
    throw new BadRequestException(
      `${fileName}: The columns ${ignoredHeaders
        .map((header) => `"${header}"`)
        .join(', ')} are not configured for import yet and cannot be uploaded.`,
    );
  }

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
    surveyPoint ?? undefined,
    sourceType,
    fileName,
    filePath,
    minDate,
    maxDate,
    importedMetrics,
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

  console.timeEnd(`Upload data file ${fileName}`);
  return ignoredHeaders;
};
