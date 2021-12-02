/* eslint-disable no-plusplus */
import { chunk, Dictionary, groupBy, head, isNaN, keyBy, minBy } from 'lodash';
import { Connection, Repository } from 'typeorm';
import {
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import fs from 'fs';
import xlsx from 'node-xlsx';
import path from 'path';
import { CastingContext, CastingFunction } from 'csv-parse';
import parse from 'csv-parse/lib/sync';
import { Point, GeoJSON } from 'geojson';
import moment from 'moment';
import Bluebird from 'bluebird';
import { ExifParserFactory } from 'ts-exif-parser';
import { Site, SiteStatus } from '../../sites/sites.entity';
import { SiteSurveyPoint } from '../../site-survey-points/site-survey-points.entity';
import { Metric, Metrics } from '../../time-series/metrics.entity';
import { TimeSeries } from '../../time-series/time-series.entity';
import { User } from '../../users/users.entity';
import { Survey, WeatherConditions } from '../../surveys/surveys.entity';
import { GoogleCloudService } from '../../google-cloud/google-cloud.service';
import {
  MediaType,
  Observations,
  SurveyMedia,
} from '../../surveys/survey-media.entity';
import { Sources } from '../../sites/sources.entity';
import { SourceType } from '../../sites/schemas/source-type.enum';
// import { backfillSiteData } from '../../workers/backfill-site-data';
// import { getRegion, getTimezones } from '../site.utils';
// import { getMMM, getHistoricalMonthlyMeans } from '../temperature';
// import { Region } from '../../regions/regions.entity';
// import { createPoint } from '../coordinates';
// import { SourceType } from '../../sites/schemas/source-type.enum';

interface Coords {
  site: number;
  colony: number;
  lat: number;
  long: number;
}

interface Data {
  id: number;
  dateTime: Date;
  bottomTemperature: number;
}

interface Repositories {
  siteRepository: Repository<Site>;
  surveyPointRepository: Repository<SiteSurveyPoint>;
  timeSeriesRepository: Repository<TimeSeries>;
  // userRepository: Repository<User>;
  // surveyRepository: Repository<Survey>;
  // surveyMediaRepository: Repository<SurveyMedia>;
  sourcesRepository: Repository<Sources>;
  // regionRepository: Repository<Region>;
  // historicalMonthlyMeanRepository: Repository<HistoricalMonthlyMean>;
}

const logger = new Logger('ParseSondeData');

// /**
//  * Parse csv data
//  * @param filePath The path to the csv file
//  * @param header The headers to be used. If undefined the column will be ignored
//  * @param range The amount or rows to skip
//  */
// const parseCSV = <T>(
//   filePath: string,
//   header: (string | undefined)[],
//   castFunction: CastingFunction,
//   range: number = 2,
// ): T[] => {
//   // Read csv file
//   const csv = fs.readFileSync(filePath);
//   // Parse csv and transform it to T
//   return parse(csv, {
//     cast: castFunction,
//     columns: header,
//     fromLine: range,
//   }) as T[];
// };

// const siteQuery = (
//   siteRepository: Repository<Site>,
//   polygon?: GeoJSON | null,
// ) => {
//   return siteRepository
//     .createQueryBuilder(`entity`)
//     .where(
//       `entity.polygon = ST_SetSRID(ST_GeomFromGeoJSON(:polygon), 4326)::geometry`,
//       { polygon },
//     )
//     .getOne();
// };

// const poiQuery = (
//   poiRepository: Repository<SiteSurveyPoint>,
//   polygon?: GeoJSON | null,
// ) => {
//   return poiRepository
//     .createQueryBuilder(`surveyPoints`)
//     .innerJoinAndSelect('surveyPoints.site', 'site')
//     .where(
//       `surveyPoints.polygon = ST_SetSRID(ST_GeomFromGeoJSON(:polygon), 4326)::geometry`,
//       { polygon },
//     )
//     .getOne();
// };

// const castCsvValues = (
//   integerColumns: string[],
//   floatColumns: string[],
//   dateColumns: string[],
// ) => (value: string, context: CastingContext) => {
//   if (!context.column) {
//     return value;
//   }

//   if (integerColumns.includes(context.column.toString())) {
//     return parseInt(value, 10);
//   }

//   if (floatColumns.includes(context.column.toString())) {
//     return parseFloat(value);
//   }

//   if (dateColumns.includes(context.column.toString())) {
//     return new Date(value);
//   }

//   return value;
// };

// /**
//  * Handle entity duplication because of spatial key constraint
//  * @param repository The repository for the entity
//  * @param polygon The polygon value
//  */
// const handleEntityDuplicate = <T>(
//   repository: Repository<T>,
//   query: (
//     repository: Repository<T>,
//     polygon?: GeoJSON | null,
//   ) => Promise<T | undefined>,
//   polygon?: GeoJSON | null,
// ) => {
//   return (err) => {
//     // Catch unique violation, i.e. there is already a site at this location
//     if (err.code === '23505') {
//       return query(repository, polygon).then((found) => {
//         if (!found) {
//           throw new InternalServerErrorException(
//             'Could not fetch conflicting entry',
//           );
//         }

//         return found;
//       });
//     }

//     throw err;
//   };
// };

// /**
//  * Read Coords.csv file
//  * @param rootPath The path of the root of the data folder
//  * @param siteIds The siteIds to be imported
//  */
// const readCoordsFile = (rootPath: string, siteIds: number[]) => {
//   // Read coords file
//   const coordsFilePath = path.join(rootPath, COLONY_COORDS_FILE);
//   const coordsHeaders = ['site', 'colony', 'lat', 'long'];
//   const castFunction = castCsvValues(['site', 'colony'], ['lat', 'long'], []);
//   return parseCSV<Coords>(coordsFilePath, coordsHeaders, castFunction).filter(
//     (record) => {
//       return siteIds.includes(record.site);
//     },
//   );
// };

// /**
//  * Create site records
//  * Calculate their position by finding the average of the coordinates of all surveyPoints in csv file
//  * @param dataAsJson The json data from the csv file
//  * @param siteIds The sites to be imported
//  * @param regionRepository The region repository
//  */
// const getSiteRecords = async (
//   dataAsJson: Coords[],
//   siteIds: number[],
//   regionRepository: Repository<Region>,
// ) => {
//   // Group by site
//   const recordsGroupedBySite = groupBy(dataAsJson, 'site');

//   // Extract site entities and calculate position of site by averaging all each surveyPoints positions
//   const sites = await Promise.all(
//     siteIds.map((siteId) => {
//       // Filter out NaN values
//       const filteredSiteCoords = recordsGroupedBySite[siteId].filter(
//         (record) => !isNaN(record.lat) && !isNaN(record.long),
//       );

//       const siteRecord = filteredSiteCoords.reduce(
//         (previous, record) => {
//           return {
//             ...previous,
//             lat: previous.lat + record.lat,
//             long: previous.long + record.long,
//           };
//         },
//         { site: siteId, colony: 0, lat: 0, long: 0 },
//       );

//       // Calculate site position
//       const point: Point = createPoint(
//         siteRecord.long / filteredSiteCoords.length,
//         siteRecord.lat / filteredSiteCoords.length,
//       );

//       // Augment site information
//       const [longitude, latitude] = point.coordinates;
//       const timezones = getTimezones(latitude, longitude) as string[];

//       return Promise.all([
//         getRegion(longitude, latitude, regionRepository),
//         getMMM(longitude, latitude),
//       ]).then(([region, maxMonthlyMean]) => ({
//         name: SITE_PREFIX + siteId,
//         polygon: point,
//         region,
//         maxMonthlyMean,
//         approved: false,
//         timezone: timezones[0],
//         status: SiteStatus.Approved,
//       }));
//     }),
//   );

//   return { recordsGroupedBySite, sites };
// };

// /**
//  * Create source entities
//  * @param poiEntities The created poi entities
//  * @param sourcesRepository The sources repository
//  */
// const createSources = async (
//   poiEntities: SiteSurveyPoint[],
//   sourcesRepository: Repository<Sources>,
// ) => {
//   // Create sources for each new poi
//   const sources = poiEntities.map((poi) => {
//     return {
//       site: poi.site,
//       poi,
//       type: SourceType.HOBO,
//     };
//   });

//   logger.log('Saving sources');
//   const sourceEntities = await Promise.all(
//     sources.map((source) =>
//       sourcesRepository
//         .findOne({
//           relations: ['poi', 'site'],
//           where: {
//             site: source.site,
//             surveyPoint: source.poi,
//             type: source.type,
//           },
//         })
//         .then((foundSource) => {
//           if (foundSource) {
//             return foundSource;
//           }

//           return sourcesRepository.save(source);
//         }),
//     ),
//   );

//   // Map surveyPoints to created sources. Hobo sources have a specified poi.
//   return keyBy(sourceEntities, (o) => o.surveyPoint!.id);
// };

// /**
//  * Parse sonde xml
//  * @param poiEntities The created poi entities
//  * @param dbIdToCSVId The reverse map (db.site.id => csv.site_id)
//  * @param rootPath The path to the root of the data folder
//  * @param poiToSourceMap A object to map surveyPoints to source entities
//  * @param timeSeriesRepository The time series repository
//  */
// const parseSondeXml = async (
//   poiEntities: SiteSurveyPoint[],
//   dbIdToCSVId: Record<number, number>,
//   rootPath: string,
//   poiToSourceMap: Dictionary<Sources>,
//   timeSeriesRepository: Repository<TimeSeries>,
// ) => {
//   // Parse hobo data
//   const parsedData = poiEntities.map((poi) => {
//     const colonyId = poi.name.split(' ')[1].padStart(3, '0');
//     const dataFile = COLONY_DATA_FILE.replace('{}', colonyId);
//     const colonyFolder = COLONY_FOLDER_PREFIX + colonyId;
//     const siteFolder = FOLDER_PREFIX + dbIdToCSVId[poi.site.id];
//     const filePath = path.join(rootPath, siteFolder, colonyFolder, dataFile);
//     const headers = [undefined, 'id', 'dateTime', 'bottomTemperature'];
//     const castFunction = castCsvValues(
//       ['id'],
//       ['bottomTemperature'],
//       ['dateTime'],
//     );
//     return parseCSV<Data>(filePath, headers, castFunction).map((data) => ({
//       timestamp: data.dateTime,
//       value: data.bottomTemperature,
//       source: poiToSourceMap[poi.id],
//       metric: Metric.BOTTOM_TEMPERATURE,
//     }));
//   });

//   // Find the earliest date of data
//   const startDates = parsedData.reduce((acc, data) => {
//     const minimum = minBy(data, (o) => o.timestamp);

//     if (!minimum) {
//       return acc;
//     }

//     return acc.concat(minimum);
//   }, []);

//   const groupedStartedDates = keyBy(startDates, (o) => o.source.site.id);

//   // Start a backfill for each site
//   const siteDiffDays: [number, number][] = Object.keys(groupedStartedDates).map(
//     (siteId) => {
//       const startDate = groupedStartedDates[siteId];
//       if (!startDate) {
//         return [parseInt(siteId, 10), 0];
//       }

//       const start = moment(startDate.timestamp);
//       const end = moment();
//       const diff = Math.min(end.diff(start, 'd'), 200);

//       return [startDate.source.site.id, diff];
//     },
//   );

//   const bottomTemperatureData = parsedData.flat();

//   // Data are to much to added with one bulk insert
//   // So we need to break them in batches
//   const batchSize = 1000;
//   logger.log(`Saving time series data in batches of ${batchSize}`);
//   const inserts = chunk(bottomTemperatureData, batchSize).map((batch) => {
//     return timeSeriesRepository
//       .createQueryBuilder('time_series')
//       .insert()
//       .values(batch)
//       .onConflict('ON CONSTRAINT "no_duplicate_data" DO NOTHING')
//       .execute();
//   });

//   // Return insert promises and print progress updates
//   const actionsLength = inserts.length;
//   await Bluebird.Promise.each(inserts, (props, idx) => {
//     logger.log(`Saved ${idx + 1} out of ${actionsLength} batches`);
//   });

//   return siteDiffDays;
// };

// export const performBackfill = (siteDiffDays: [number, number][]) => {
//   siteDiffDays.forEach(([siteId, diff]) => {
//     logger.log(`Performing backfill for site ${siteId} for ${diff} days`);
//     backfillSiteData(siteId, diff);
//   });
// };

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
  return new Date(Math.round((dateSerial - 25569) * 86400 * 1000));
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
        // eslint-disable-next-line fp/no-mutation
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

  console.log(sourceEntity);

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
        console.log(valueObject);
        return false;
      });

    // console.log(dataAstimeSeries);

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
    console.log('loading complete');
  }
};
