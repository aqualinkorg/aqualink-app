/* eslint-disable no-plusplus */
import { chunk, isNaN } from 'lodash';
import md5Fle from 'md5-file';
import { Repository } from 'typeorm';
import {
  BadRequestException,
  ConflictException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
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
};

const ACCEPTED_FILE_TYPES = [
  {
    extension: 'xlsx',
    mimeType:
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  },
];

export const fileFilter: MulterOptions['fileFilter'] = (
  _,
  { mimetype },
  callback,
) => {
  if (!ACCEPTED_FILE_TYPES.map(({ mimeType }) => mimeType).includes(mimetype)) {
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

const getTimestampFromExcelSerials = (
  dateSerial: number,
  hourSerial: number,
  seconds: number,
) => {
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

const validateHeaders = (
  file: string,
  workSheetData: any[],
  headerKeys: string[],
) => {
  // The header row must contain all header keys.
  const headerRowIndex = workSheetData.findIndex((row) =>
    headerKeys.every((header) => row.includes(header)),
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
      `${file}: File must contain at least one of the following columns: [${Object.keys(
        metricsMapping,
      ).join(', ')}]`,
    );
  }

  const ignoredHeaders = headerRow.filter(
    (header) =>
      ![...headerKeys, ...Object.keys(metricsMapping)].includes(header) &&
      header !== 'Site Name',
  );

  return ignoredHeaders as string[];
};

const findXLSXDataWithHeader = (workSheetData: any[], headerKey: string) => {
  const { tempHeaders: headers, tempData: data } = workSheetData.reduce(
    ({ tempHeaders, tempData }: any, row) => {
      if (row.includes(headerKey)) {
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
        timestamp: getTimestampFromExcelSerials(
          dataObject['Date (MM/DD/YYYY)'],
          dataObject['Time (HH:mm:ss)'],
          dataObject['Time (Fract. Sec)'],
        ),
        ...renameKeys(dataObject, metricsMapping),
      };
    })
    .filter((object) => object !== undefined);

  return dataAsObjects;
};

// Upload sonde data
export const uploadSondeData = async (
  filePath: string,
  fileName: string,
  siteId: string,
  surveyPointId: string | undefined,
  sondeType: string,
  repositories: Repositories,
  failOnWarning: boolean,
) => {
  // TODO
  // - Add foreign key constraint to sources on site_id

  const site = await repositories.siteRepository.findOne({
    where: { id: parseInt(siteId, 10) },
  });

  const surveyPoint = surveyPointId
    ? await repositories.surveyPointRepository.findOne({
        where: { id: parseInt(surveyPointId, 10) },
      })
    : undefined;

  if (!site) {
    throw new NotFoundException(`Site with id ${siteId} does not exist`);
  }

  const existingSourceEntity = await repositories.sourcesRepository.findOne({
    relations: ['surveyPoint', 'site'],
    where: {
      site: { id: siteId },
      surveyPoint: surveyPointId || null,
      type: SourceType.SONDE,
    },
  });

  const sourceEntity =
    existingSourceEntity ||
    (await repositories.sourcesRepository.save({
      type: SourceType.SONDE,
      site,
      surveyPoint,
    }));

  if (sondeType === 'sonde') {
    const workSheetsFromFile = xlsx.parse(filePath, { raw: true });
    const workSheetData = workSheetsFromFile[0]?.data;
    const ignoredHeaders = validateHeaders(fileName, workSheetData, [
      'Date (MM/DD/YYYY)',
      'Time (HH:mm:ss)',
      'Time (Fract. Sec)',
    ]);

    if (failOnWarning && ignoredHeaders.length > 0) {
      throw new BadRequestException(
        `${fileName}: These columns are not configured for import yet and cannot be uploaded: ${ignoredHeaders
          .map((header) => `"${header}"`)
          .join(', ')}.`,
      );
    }

    const results = findXLSXDataWithHeader(workSheetData, 'Date (MM/DD/YYYY)');

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
                value: object[key],
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

    if (surveyPoint) {
      // If the upload exists as described above, then update it, otherwise save it.
      const uploadExists = await repositories.dataUploadsRepository.findOne({
        where: {
          signature,
          site,
          surveyPoint,
          sensorType: SourceType.SONDE,
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
        sensorType: SourceType.SONDE,
        site,
        surveyPoint,
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

    return ignoredHeaders;
  }

  return [];
};
