/* eslint-disable no-plusplus */
import { chunk, get, isNaN, last, maxBy, minBy } from 'lodash';
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

interface Repositories {
  siteRepository: Repository<Site>;
  surveyPointRepository: Repository<SiteSurveyPoint>;
  timeSeriesRepository: Repository<TimeSeries>;
  sourcesRepository: Repository<Sources>;
  dataUploadsRepository: Repository<DataUploads>;
}

const logger = new Logger('ParseSondeData');

const metricsMapping: Record<string, Metric> = {
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
  pH: Metric.PH,
  'pH mV': Metric.PH_MV,
  'Temp °C': Metric.BOTTOM_TEMPERATURE,
  'Battery V': Metric.SONDE_BATTERY_VOLTAGE,
  'Cable Pwr V': Metric.SONDE_CABLE_POWER_VOLTAGE,
  'Pressure, mbar (LGR S/N: 21067056, SEN S/N: 21062973)': Metric.PRESSURE,
  'Rain, mm (LGR S/N: 21067056, SEN S/N: 21065937)': Metric.PRECIPITATION,
  'Temp, °C (LGR S/N: 21067056, SEN S/N: 21067709)': Metric.AIR_TEMPERATURE,
  'RH, % (LGR S/N: 21067056, SEN S/N: 21067709)': Metric.RH,
  'Wind Speed, m/s (LGR S/N: 21067056, SEN S/N: 21091774)': Metric.WIND_SPEED,
  'Gust Speed, m/s (LGR S/N: 21067056, SEN S/N: 21091774)':
    Metric.WIND_GUST_SPEED,
  'Wind Direction, ø (LGR S/N: 21067056, SEN S/N: 21091774)':
    Metric.WIND_DIRECTION,
};

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

export const requiredHeadersForMimetype = (mimetype: Mimetype): string[] => {
  switch (mimetype) {
    case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
      return ['Date (MM/DD/YYYY)', 'Time (HH:mm:ss)', 'Time (Fract. Sec)'];
    case 'text/csv':
      return ['Date Time'];
    default:
      return [];
  }
};

const rowIncludesHeaderKeys = (row: any, headerKeys: string[]): boolean =>
  headerKeys.every((header) =>
    row.some((cell) => {
      return typeof cell === 'string' && cell.startsWith(header);
    }),
  );

function renameKeys(obj, newKeys) {
  const keyValues = Object.keys(obj).map((key) => {
    if (key in newKeys) {
      const newKey = newKeys[key] || key;
      return { [newKey]: obj[key] };
    }
    return {};
  });
  return Object.assign({}, ...keyValues);
}

function ExcelDateToJSDate(dateSerial: number) {
  // 25569 is the number of days between 1 January 1900 and 1 January 1970.
  const EXCEL_DAY_CONVERSION = 25569;
  const milliSecondsInADay = 86400 * 1000;
  return new Date(
    Math.round((dateSerial - EXCEL_DAY_CONVERSION) * milliSecondsInADay),
  );
}

const getTimestampFromExcelSerials = (dataObject: any) => {
  const dateSerial = dataObject['Date (MM/DD/YYYY)'];
  const hourSerial = dataObject['Time (HH:mm:ss)'];
  const seconds = dataObject['Time (Fract. Sec)'];
  // Extract EXCEL date and hours from serials:
  const date = ExcelDateToJSDate(dateSerial);
  const hours = (hourSerial * 24) % 24;
  const hoursFloor = Math.floor(hours);
  const decimalHours = hours - hoursFloor;
  date.setHours(hoursFloor);
  date.setMinutes(Math.round(decimalHours * 60));
  date.setSeconds(seconds);
  return date;
};

const getTimestampFromCsvDateString = (dataObject: any) => {
  const dateKey = Object.keys(dataObject).find((key) =>
    key.startsWith('Date Time'),
  );

  if (!dateKey) {
    return undefined;
  }

  const timezone = last(dateKey.split(', '));

  if (timezone) {
    return new Date(`${dataObject[dateKey]} ${timezone}`);
  }

  return new Date(dataObject[dateKey]);
};

const validateHeaders = (
  file: string,
  workSheetData: any[],
  headerKeys: string[],
) => {
  // The header row must contain all header keys.
  const headerRowIndex = workSheetData.findIndex((row) =>
    rowIncludesHeaderKeys(row, headerKeys),
  );

  if (headerRowIndex === -1) {
    throw new BadRequestException(
      `${file}: [${headerKeys.join(
        ', ',
      )}] must be included in the column headers`,
    );
  }

  // Check if the header row contains at least one of the metricsMapping keys.
  const headerRow = workSheetData[headerRowIndex];
  const isHeaderRowValid = headerRow.some((header) => header in metricsMapping);

  if (!isHeaderRowValid) {
    throw new BadRequestException(
      `${file}: At least on of the [${Object.keys(metricsMapping).join(
        ', ',
      )}] columns should be included.`,
    );
  }

  const ignoredHeaders = headerRow.filter(
    (header) =>
      ![...headerKeys, ...Object.keys(metricsMapping)].some((item) =>
        header.startsWith(item),
      ) &&
      header !== 'Site Name' &&
      header !== '#',
  ) as string[];

  const importedHeaders = headerRow
    .filter(
      (header) =>
        Object.keys(metricsMapping).some((item) => header.startsWith(item)) &&
        header !== 'Site Name' &&
        header !== '#',
    )
    .map((header) => metricsMapping[header]) as Metric[];

  return { ignoredHeaders, importedHeaders };
};

const extractHeadersAndData = (workSheetData: any[], headerKeys: string[]) => {
  const { tempHeaders: headers, tempData: data } = workSheetData.reduce(
    ({ tempHeaders, tempData }: any, row) => {
      if (rowIncludesHeaderKeys(row, headerKeys)) {
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

const timeStampExtractor = (dataObject: any, mimetype: Mimetype) => {
  switch (mimetype) {
    case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
      return getTimestampFromExcelSerials(dataObject);
    case 'text/csv':
      return getTimestampFromCsvDateString(dataObject);
    default:
      return undefined;
  }
};

const findSheetDataWithHeader = (
  workSheetData: any[],
  headerKeys: string[],
  mimetype: Mimetype,
) => {
  const { headers, data } = extractHeadersAndData(workSheetData, headerKeys);

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
        timestamp: timeStampExtractor(dataObject, mimetype),
        ...renameKeys(dataObject, metricsMapping),
      };
    })
    .filter((object) => object !== undefined);

  return dataAsObjects;
};

// Upload sonde data
export const uploadTimeSeriesData = async (
  filePath: string,
  fileName: string,
  mimetype: Mimetype,
  siteId: string,
  surveyPointId: string | undefined,
  sourceType: SourceType,
  repositories: Repositories,
  failOnWarning?: boolean,
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

  if (sourceType === SourceType.SONDE || sourceType === SourceType.METLOG) {
    const workSheetsFromFile = xlsx.parse(filePath, { raw: true });
    const workSheetData = workSheetsFromFile[0]?.data;
    const requiredHeaders = requiredHeadersForMimetype(mimetype);
    const { ignoredHeaders, importedHeaders } = validateHeaders(
      fileName,
      workSheetData,
      requiredHeaders,
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

    const results = findSheetDataWithHeader(
      workSheetData,
      requiredHeaders,
      mimetype,
    );

    const dataAstimeSeries = results
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
      });

    const signature = await md5Fle(filePath);
    const minDate = get(
      minBy(dataAstimeSeries, (item) =>
        new Date(get(item, 'timestamp')).getTime(),
      ),
      'timestamp',
    );
    const maxDate = get(
      maxBy(dataAstimeSeries, (item) =>
        new Date(get(item, 'timestamp')).getTime(),
      ),
      'timestamp',
    );

    if (surveyPoint) {
      // If the upload exists as described above, then update it, otherwise save it.
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

      await repositories.dataUploadsRepository.save({
        file: fileName,
        signature,
        sensorType: sourceType,
        site,
        surveyPoint,
        minDate,
        maxDate,
        metrics: importedHeaders,
      });
    }

    // Data are to much to added with one bulk insert
    // So we need to break them in batches
    const batchSize = 1000;
    logger.log(`Saving time series data in batches of ${batchSize}`);
    const inserts = chunk(dataAstimeSeries, batchSize).map((batch: any[]) => {
      return (
        repositories.timeSeriesRepository
          .createQueryBuilder('time_series')
          .insert()
          .values(batch)
          // If there's a conflict, replace data with the new value.
          .onConflict(
            'ON CONSTRAINT "no_duplicate_data" DO UPDATE SET "value" = excluded.value',
          )
          .execute()
      );
    });

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
