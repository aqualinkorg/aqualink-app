/* eslint-disable no-plusplus */
import { chunk, isNaN } from 'lodash';
import { Connection, Repository } from 'typeorm';
import { Logger } from '@nestjs/common';
import xlsx from 'node-xlsx';
import Bluebird from 'bluebird';
import { Site } from '../../sites/sites.entity';
import { SiteSurveyPoint } from '../../site-survey-points/site-survey-points.entity';
import { Metric } from '../../time-series/metrics.entity';
import { TimeSeries } from '../../time-series/time-series.entity';
import { Sources } from '../../sites/sources.entity';
import { SourceType } from '../../sites/schemas/source-type.enum';

interface Repositories {
  siteRepository: Repository<Site>;
  surveyPointRepository: Repository<SiteSurveyPoint>;
  timeSeriesRepository: Repository<TimeSeries>;
  sourcesRepository: Repository<Sources>;
}

const logger = new Logger('ParseSondeData');

const metricsMapping: { [name: string]: Metric } = {
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

// Upload hobo data
// Returns a object with keys the db site ids and values the corresponding imported site ids
export const uploadSondeData = async (
  filePath: string,
  siteId: string,
  surveyPointId: string,
  sondeType: string,
  connection: Connection,
  repositories: Repositories,
) => {
  // TODO
  // - Add foreign key constraint to sources on site_id

  const sourceEntity = await repositories.sourcesRepository
    .findOne({
      relations: ['surveyPoint', 'site'],
      where: {
        site: { id: siteId },
        // surveyPoint: surveyPointId,
        type: SourceType.SONDE,
      },
    })
    .then((foundSource) => {
      if (foundSource) {
        return foundSource;
      }
      return repositories.sourcesRepository.save({
        site_id: siteId,
        // survey_point_id: 2,
        type: SourceType.SONDE,
      });
    });

  logger.log(sourceEntity);

  if (sondeType === 'sonde') {
    const workSheetsFromFile = xlsx.parse(filePath, { raw: true });
    const workSheetData = workSheetsFromFile[0]?.data;
    const results = findXLSXDataWithHeader(workSheetData, 'Chlorophyll RFU');

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
        logger.log('excluding incompatible value:');
        logger.log(valueObject);
        return false;
      });

    // Data are to much to added with one bulk insert
    // So we need to break them in batches
    const batchSize = 1000;
    logger.log(`Saving time series data in batches of ${batchSize}`);
    const inserts = chunk(dataAstimeSeries, batchSize).map((batch: any[]) => {
      return repositories.timeSeriesRepository
        .createQueryBuilder('time_series')
        .insert()
        .values(batch)
        .onConflict('ON CONSTRAINT "no_duplicate_data" DO NOTHING')
        .execute();
    });

    // Return insert promises and print progress updates
    const actionsLength = inserts.length;
    await Bluebird.Promise.each(inserts, (props, idx) => {
      logger.log(`Saved ${idx + 1} out of ${actionsLength} batches`);
    });
    logger.log('loading complete');
  }
};
