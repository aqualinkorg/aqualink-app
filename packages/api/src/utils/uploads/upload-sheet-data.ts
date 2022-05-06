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
import { getSite, getSiteAndSurveyPoint } from '../site.utils';
import { GoogleCloudService } from '../../google-cloud/google-cloud.service';

interface Repositories {
  siteRepository: Repository<Site>;
  surveyPointRepository: Repository<SiteSurveyPoint>;
  timeSeriesRepository: Repository<TimeSeries>;
  sourcesRepository: Repository<Sources>;
  dataUploadsRepository: Repository<DataUploads>;
}

const logger = new Logger('ParseSondeData');

// If column names risk overlapping, make sure to put the longer
// name first. Eg. "pH mV" and "pH".
const metricsMapping: Record<SourceType, Record<string, Metric>> = {
  sonde: {
    'Chlorophyll RFU': Metric.CHOLOROPHYLL_RFU,
    'Chlorophyll ug/L': Metric.CHOLOROPHYLL_CONCENTRATION,
    'Cond µS/cm': Metric.CONDUCTIVITY,
    'Depth m': Metric.WATER_DEPTH,
    'ODO % sat': Metric.ODO_SATURATION,
    'ODO mg/L': Metric.ODO_CONCENTRATION,
    'Sal psu': Metric.SALINITY,
    'SpCond µS/cm': Metric.SPECIFIC_CONDUCTANCE,
    'TDS mg/L': Metric.TDS,
    'Turbidity FNU': Metric.TURBIDITY,
    'TSS mg/L': Metric.TOTAL_SUSPENDED_SOLIDS,
    'Wiper Position volt': Metric.SONDE_WIPER_POSITION,
    'pH mV': Metric.PH_MV,
    pH: Metric.PH,
    'Temp °C': Metric.BOTTOM_TEMPERATURE,
    'Battery V': Metric.SONDE_BATTERY_VOLTAGE,
    'Cable Pwr V': Metric.SONDE_CABLE_POWER_VOLTAGE,
  },
  metlog: {
    'Pressure, mbar': Metric.PRESSURE,
    'Rain, mm': Metric.PRECIPITATION,
    'Temp, °C': Metric.AIR_TEMPERATURE,
    'RH, %': Metric.RH,
    'Wind Speed, m/s': Metric.WIND_SPEED,
    'Gust Speed, m/s': Metric.WIND_GUST_SPEED,
    'Wind Direction, ø': Metric.WIND_DIRECTION,
  },
  gfs: {},
  hobo: { Temp: Metric.BOTTOM_TEMPERATURE },
  noaa: {},
  spotter: {},
};

// Timezone regexp to match the following cases:
// 1. GMT±1
// 2. GMT±01
// 3. GMT±01:00
const TIMEZONE_REGEX = /[+-][0-9]{1,2}:?[0-9]{0,2}\b/;
const HEADER_KEYS = ['Date (MM/DD/YYYY)', 'Date Time', 'Date_Time'];
// Keep Ignore Header Keys in lower case.
const IGNORE_HEADER_KEYS = [
  '#',
  'site name',
  'time (hh:mm:ss)',
  'time (fract. sec)',
];

const TIMESTAMP_KEYS = [
  ['Date Time'],
  ['Date (MM/DD/YYYY)', 'Time (HH:mm:ss)', 'Time (Fract. Sec)'],
];

/**
 * @param {Object} object
 * @param {string} key
 * @return {any} value
 */
function getParameterCaseInsensitive(object: Object, key: string): any {
  const asLowercase = key.toLowerCase();
  const matchingKey = Object.keys(object).find(
    (k) => k.toLowerCase() === asLowercase,
  );

  return matchingKey ? object[matchingKey] : undefined;
}

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

const isHeaderRow = (row: any) =>
  HEADER_KEYS.some((key) =>
    row.some((cell) => {
      return typeof cell === 'string' && headerMatchesKey(cell, key);
    }),
  );

const rowIncludesHeaderKeys = (row: string[], headerKeys: string[]) =>
  headerKeys.every((key) =>
    row.some((dataKey) => headerMatchesKey(dataKey, key)),
  );

const renameKeys = (
  oldKeys: string[],
  source: SourceType,
): Partial<Record<string, Metric>> => {
  const metricsKeys = Object.keys(metricsMapping[source]);

  return oldKeys.reduce((acc, curr) => {
    const metricKey = metricsKeys.find((key) => headerMatchesKey(curr, key));
    return metricKey
      ? { ...acc, [curr]: metricsMapping[source][metricKey] as Metric }
      : acc;
  }, {});
};

const ExcelDateToJSDate = (dateSerial: number) => {
  // 25569 is the number of days between 1 January 1900 and 1 January 1970.
  const EXCEL_DAY_CONVERSION = 25569;
  const milliSecondsInADay = 86400 * 1000;
  return new Date(
    Math.round((dateSerial - EXCEL_DAY_CONVERSION) * milliSecondsInADay),
  );
};

const getTimestampFromMultiColumnDate = (
  dataObject: any,
  mimetype?: Mimetype,
) => {
  const dateValue = getParameterCaseInsensitive(
    dataObject,
    'Date (MM/DD/YYYY)',
  );
  const hoursValue = getParameterCaseInsensitive(dataObject, 'Time (HH:mm:ss)');

  const secondsValue = getParameterCaseInsensitive(
    dataObject,
    'Time (Fract. Sec)',
  );

  // In we are parsing a `.csv` file, the above date values are parsed as strings.
  if (mimetype === 'text/csv') {
    const date = new Date(`${dateValue} ${hoursValue} UTC`);
    date.setSeconds(secondsValue);

    return date;
  }

  const date = ExcelDateToJSDate(dateValue);
  const hours = (hoursValue * 24) % 24;
  const hoursFloor = Math.floor(hours);
  const decimalHours = hours - hoursFloor;
  date.setHours(hoursFloor);
  date.setMinutes(Math.round(decimalHours * 60));
  date.setSeconds(secondsValue);

  return date;
};

const getTimestampFromDateString = (dataObject: any) => {
  const dateKey = Object.keys(dataObject).find((header) =>
    headerMatchesKey(header, 'Date Time'),
  );

  if (!dateKey) {
    // TODO - Can we raise an error here instead? Is it safe?
    return undefined;
  }

  const timezoneOffset = first(dateKey.match(TIMEZONE_REGEX));

  if (timezoneOffset) {
    return new Date(`${dataObject[dateKey]} GMT ${timezoneOffset}`);
  }

  return new Date(dataObject[dateKey]);
};

const validateHeaders = (
  file: string,
  workSheetData: any[],
  source: SourceType,
) => {
  const metricsKeys = Object.keys(metricsMapping[source]);
  const headerRowIndex = workSheetData.findIndex(isHeaderRow);

  if (headerRowIndex === -1) {
    throw new BadRequestException(
      `${file}: At least one of [${HEADER_KEYS.join(
        ', ',
      )}] must be included in the column headers`,
    );
  }

  // Check if the header row contains at least one of the metricsMapping keys.
  const headerRow: string[] = workSheetData[headerRowIndex];
  const isHeaderRowValid = headerRow.some((header) =>
    metricsKeys.some((metricsKey) => headerMatchesKey(header, metricsKey)),
  );

  if (!isHeaderRowValid) {
    throw new BadRequestException(
      `${file}: At least on of the [${metricsKeys.join(
        ', ',
      )}] columns should be included.`,
    );
  }

  const ignoredHeaders = headerRow.filter(
    (header) =>
      ![...HEADER_KEYS, ...metricsKeys].some((key) =>
        headerMatchesKey(header, key),
      ) && !IGNORE_HEADER_KEYS.includes(header.toLowerCase()),
  ) as string[];

  const importedHeaders = headerRow
    .filter(
      (header) =>
        metricsKeys.some((key) => headerMatchesKey(header, key)) &&
        !IGNORE_HEADER_KEYS.includes(header.toLowerCase()),
    )
    .map(
      (header) =>
        metricsMapping[source][
          metricsKeys.find((key) => headerMatchesKey(header, key)) as string
        ],
    ) as Metric[];

  return { ignoredHeaders, importedHeaders };
};

const extractHeadersAndData = (workSheetData: any[]) => {
  const { tempHeaders: headers, tempData: data } = workSheetData.reduce(
    ({ tempHeaders, tempData }: any, row) => {
      if (isHeaderRow(row)) {
        // eslint-disable-next-line fp/no-mutation, no-param-reassign
        tempHeaders = row;
      } else if (row[0] != null && tempHeaders != null) {
        // eslint-disable-next-line fp/no-mutating-methods
        tempData.push(row);
      }
      return { tempHeaders, tempData };
    },
    { tempHeaders: null, tempData: [] },
  );

  return { headers, data };
};

const timeStampExtractor = (
  file: string,
  dataObject: any,
  mimetype?: Mimetype,
) => {
  const dataKeys = Object.keys(dataObject);
  switch (true) {
    case rowIncludesHeaderKeys(dataKeys, TIMESTAMP_KEYS[0]):
      return getTimestampFromDateString(dataObject);
    case rowIncludesHeaderKeys(dataKeys, TIMESTAMP_KEYS[1]):
      return getTimestampFromMultiColumnDate(dataObject, mimetype);
    default:
      throw new BadRequestException(
        `${file}: Column headers must include at least one of the following sets of headers: ${TIMESTAMP_KEYS.map(
          (keys) => `[${keys.join(', ')}]`,
        ).join(', ')}`,
      );
  }
};

const rowValuesExtractor = (row: any, headers: any, source: SourceType) => {
  const keysMapping = renameKeys(headers, source);

  return Object.keys(row).reduce(
    (acc, curr) =>
      curr in keysMapping
        ? { ...acc, [keysMapping[curr] as string]: row[curr] }
        : acc,
    {},
  );
};

const findSheetDataWithHeader = (
  fileName: string,
  workSheetData: any[],
  source: SourceType,
  mimetype?: Mimetype,
) => {
  const { headers, data } = extractHeadersAndData(workSheetData);

  const dataAsObjects = data
    .map((row) => {
      if (row.length !== headers.length) {
        return undefined;
      }
      const dataObject = headers.reduce(
        (a, v, i) => ({ ...a, [v]: row[i] }),
        {},
      );

      return {
        timestamp: timeStampExtractor(fileName, dataObject, mimetype),
        ...rowValuesExtractor(dataObject, headers, source),
      };
    })
    .filter((object) => object !== undefined);

  return dataAsObjects;
};

// Upload sonde data
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
  // // TODO
  // // - Add foreign key constraint to sources on site_id
  const { site, surveyPoint } = surveyPointId
    ? await getSiteAndSurveyPoint(
        parseInt(siteId, 10),
        parseInt(surveyPointId, 10),
        repositories.siteRepository,
        repositories.surveyPointRepository,
      )
    : {
        site: await getSite(parseInt(siteId, 10), repositories.siteRepository),
        surveyPoint: undefined,
      };

  const existingSourceEntity = await repositories.sourcesRepository.findOne({
    relations: ['surveyPoint', 'site'],
    where: {
      site: { id: siteId },
      surveyPoint: surveyPointId || null,
      type: sourceType,
    },
  });

  const sourceEntity =
    existingSourceEntity ||
    (await repositories.sourcesRepository.save({
      type: sourceType,
      site,
      surveyPoint,
    }));

  if (
    sourceType === SourceType.SONDE ||
    sourceType === SourceType.METLOG ||
    sourceType === SourceType.HOBO
  ) {
    const workSheetsFromFile = xlsx.parse(filePath, { raw: true });
    const workSheetData = workSheetsFromFile[0]?.data;
    const { ignoredHeaders, importedHeaders } = validateHeaders(
      fileName,
      workSheetData,
      sourceType,
    );

    if (failOnWarning && ignoredHeaders.length > 0) {
      throw new BadRequestException(
        `${fileName}: The columns ${ignoredHeaders
          .map((header) => `"${header}"`)
          .join(
            ', ',
          )} are not configured for import yet and cannot be uploaded.`,
      );
    }

    const signature = await md5Fle(filePath);

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

    const results = findSheetDataWithHeader(
      fileName,
      workSheetData,
      sourceType,
      mimetype,
    );

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
          logger.log('Excluding incompatible value:');
          logger.log(valueObject);
          return false;
        }),
      ({ timestamp, metric, source }) =>
        `${timestamp}, ${metric}, ${source.id}`,
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
    const batchSize = 10;
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
          console.warn('The following batch failed to upload:');
          console.log(batch);
        }
        return true;
      },
    );

    // Return insert promises and print progress updates
    const actionsLength = inserts.length;
    await Bluebird.Promise.each(inserts, (props, idx) => {
      logger.log(`Saved ${idx + 1} out of ${actionsLength} batches`);
    });
    logger.log('loading complete');
    await repositories.dataUploadsRepository.query(
      'REFRESH MATERIALIZED VIEW latest_data',
    );
    return ignoredHeaders;
  }

  return [];
};
