import { chunk, Dictionary, groupBy, isNaN, keyBy, minBy } from 'lodash';
import { DataSource, ObjectLiteral, Repository } from 'typeorm';
import {
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import fs from 'fs';
import path from 'path';
import { CastingContext, CastingFunction } from 'csv-parse';
import { Point, GeoJSON } from 'geojson';
import Bluebird from 'bluebird';
import { ExifParserFactory } from 'ts-exif-parser';
import parse from 'csv-parse/lib/sync';

import { DateTime } from 'luxon';
import { Site, SiteStatus } from '../../sites/sites.entity';
import { SiteSurveyPoint } from '../../site-survey-points/site-survey-points.entity';
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
import { backfillSiteData } from '../../workers/backfill-site-data';
import { getRegion, getTimezones } from '../site.utils';
import { getMMM, getHistoricalMonthlyMeans } from '../temperature';
import { Region } from '../../regions/regions.entity';
import { HistoricalMonthlyMean } from '../../sites/historical-monthly-mean.entity';
import { createPoint } from '../coordinates';
import { SourceType } from '../../sites/schemas/source-type.enum';
import { DataUploads } from '../../data-uploads/data-uploads.entity';
import { refreshMaterializedView } from '../time-series.utils';
import { Metric } from '../../time-series/metrics.enum';

/**
 * Parse csv data
 * @param filePath The path to the csv file
 * @param header The headers to be used. If undefined the column will be ignored
 * @param range The amount or rows to skip
 */
export const parseCSV = <T>(
  filePath: string,
  header: (string | undefined)[],
  castFunction: CastingFunction,
  range: number = 2,
): T[] => {
  // Read csv file
  const csv = fs.readFileSync(filePath);
  // Parse csv and transform it to T
  return parse(csv, {
    cast: castFunction,
    columns: header,
    fromLine: range,
  }) as T[];
};

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
  userRepository: Repository<User>;
  surveyRepository: Repository<Survey>;
  surveyMediaRepository: Repository<SurveyMedia>;
  sourcesRepository: Repository<Sources>;
  regionRepository: Repository<Region>;
  historicalMonthlyMeanRepository: Repository<HistoricalMonthlyMean>;
  dataUploadsRepository: Repository<DataUploads>;
}

const FOLDER_PREFIX = 'Patch_Site_';
const SITE_PREFIX = 'Patch Site ';
const COLONY_COORDS_FILE = 'Colony_Coords.csv';
const COLONY_FOLDER_PREFIX = 'Col_';
const COLONY_PREFIX = 'Colony ';
const COLONY_DATA_FILE = 'Col{}_FullHOBO_zoned.csv';
const validFiles = new Set(['png', 'jpeg', 'jpg']);

const logger = new Logger('ParseHoboData');

const siteQuery = (
  siteRepository: Repository<Site>,
  polygon?: GeoJSON | null,
) => {
  return siteRepository
    .createQueryBuilder(`entity`)
    .where(
      `entity.polygon = ST_SetSRID(ST_GeomFromGeoJSON(:polygon), 4326)::geometry`,
      { polygon },
    )
    .getOne();
};

const poiQuery = (
  poiRepository: Repository<SiteSurveyPoint>,
  polygon?: GeoJSON | null,
) => {
  return poiRepository
    .createQueryBuilder(`surveyPoints`)
    .innerJoinAndSelect('surveyPoints.site', 'site')
    .where(
      `surveyPoints.polygon = ST_SetSRID(ST_GeomFromGeoJSON(:polygon), 4326)::geometry`,
      { polygon },
    )
    .getOne();
};

const castCsvValues =
  (integerColumns: string[], floatColumns: string[], dateColumns: string[]) =>
  (value: string, context: CastingContext) => {
    if (!context.column) {
      return value;
    }

    if (integerColumns.includes(context.column.toString())) {
      return parseInt(value, 10);
    }

    if (floatColumns.includes(context.column.toString())) {
      return parseFloat(value);
    }

    if (dateColumns.includes(context.column.toString())) {
      return new Date(value);
    }

    return value;
  };

/**
 * Handle entity duplication because of spatial key constraint
 * @param repository The repository for the entity
 * @param polygon The polygon value
 */
const handleEntityDuplicate = <T extends ObjectLiteral>(
  repository: Repository<T>,
  query: (
    repository: Repository<T>,
    polygon?: GeoJSON | null,
  ) => Promise<T | null>,
  polygon?: GeoJSON | null,
) => {
  return (err) => {
    // Catch unique violation, i.e. there is already a site at this location
    if (err.code === '23505') {
      return query(repository, polygon).then((found) => {
        if (!found) {
          throw new InternalServerErrorException(
            'Could not fetch conflicting entry',
          );
        }

        return found;
      });
    }

    throw err;
  };
};

/**
 * Read Coords.csv file
 * @param rootPath The path of the root of the data folder
 * @param siteIds The siteIds to be imported
 */
const readCoordsFile = (rootPath: string, siteIds: number[]) => {
  // Read coords file
  const coordsFilePath = path.join(rootPath, COLONY_COORDS_FILE);
  const coordsHeaders = ['site', 'colony', 'lat', 'long'];
  const castFunction = castCsvValues(['site', 'colony'], ['lat', 'long'], []);
  return parseCSV<Coords>(coordsFilePath, coordsHeaders, castFunction).filter(
    (record) => {
      return siteIds.includes(record.site);
    },
  );
};

/**
 * Create site records
 * Calculate their position by finding the average of the coordinates of all surveyPoints in csv file
 * @param dataAsJson The json data from the csv file
 * @param siteIds The sites to be imported
 * @param regionRepository The region repository
 */
const getSiteRecords = async (
  dataAsJson: Coords[],
  siteIds: number[],
  regionRepository: Repository<Region>,
) => {
  // Group by site
  const recordsGroupedBySite = groupBy(dataAsJson, 'site');

  // Extract site entities and calculate position of site by averaging all each surveyPoints positions
  const sites = await Promise.all(
    siteIds.map((siteId) => {
      // Filter out NaN values
      const filteredSiteCoords = recordsGroupedBySite[siteId].filter(
        (record) => !isNaN(record.lat) && !isNaN(record.long),
      );

      const siteRecord = filteredSiteCoords.reduce(
        (previous, record) => {
          return {
            ...previous,
            lat: previous.lat + record.lat,
            long: previous.long + record.long,
          };
        },
        { site: siteId, colony: 0, lat: 0, long: 0 },
      );

      // Calculate site position
      const point: Point = createPoint(
        siteRecord.long / filteredSiteCoords.length,
        siteRecord.lat / filteredSiteCoords.length,
      );

      // Augment site information
      const [longitude, latitude] = point.coordinates;
      const timezones = getTimezones(latitude, longitude) as string[];

      return Promise.all([
        getRegion(longitude, latitude, regionRepository),
        getMMM(longitude, latitude),
      ]).then(([region, maxMonthlyMean]) => ({
        name: SITE_PREFIX + siteId,
        polygon: point,
        region,
        maxMonthlyMean,
        display: false,
        timezone: timezones[0],
        status: SiteStatus.Approved,
      }));
    }),
  );

  return { recordsGroupedBySite, sites };
};

/**
 * Save site records to database or fetch already existing sites
 * @param sites The site records to be saved
 * @param user The user to associate site with
 * @param siteRepository The site repository
 * @param userRepository The user repository
 * @param historicalMonthlyMeanRepository The monthly max repository
 */
const createSites = async (
  sites: Partial<Site>[],
  user: User,
  siteRepository: Repository<Site>,
  userRepository: Repository<User>,
  historicalMonthlyMeanRepository: Repository<HistoricalMonthlyMean>,
) => {
  logger.log('Saving sites');
  const siteEntities = await Promise.all(
    sites.map((site) =>
      siteRepository
        .save(site)
        .catch(handleEntityDuplicate(siteRepository, siteQuery, site.polygon)),
    ),
  );

  logger.log(`Saving monthly max data`);
  await Bluebird.map(
    siteEntities,
    (site) => {
      const point: Point = site.polygon as Point;
      const [longitude, latitude] = point.coordinates;

      return Promise.all([
        getHistoricalMonthlyMeans(longitude, latitude),
        historicalMonthlyMeanRepository.findOne({
          where: { site: { id: site.id } },
        }),
      ]).then(([historicalMonthlyMean, found]) => {
        if (found || !historicalMonthlyMean) {
          logger.warn(`Site ${site.id} has already monthly max data`);
          return null;
        }

        return historicalMonthlyMean.map(({ month, temperature }) => {
          return (
            temperature &&
            historicalMonthlyMeanRepository.save({ site, month, temperature })
          );
        });
      });
    },
    { concurrency: 4 },
  );

  // Create reverse map (db.site.id => csv.site_id)
  const dbIdToCSVId: Record<number, number> = Object.fromEntries(
    siteEntities.map((site) => {
      if (!site.name) {
        throw new InternalServerErrorException('Site name was not defined');
      }

      const siteId = parseInt(site.name.replace(SITE_PREFIX, ''), 10);
      return [site.id, siteId];
    }),
  );

  // Update administered sites relationship
  await userRepository.save({
    id: user.id,
    administeredSites: user.administeredSites.concat(siteEntities),
  });

  return { siteEntities, dbIdToCSVId };
};

/**
 * Create and save site point of interest records
 * @param siteEntities The saved site entities
 * @param dbIdToCSVId The reverse map (db.site.id => csv.site_id)
 * @param recordsGroupedBySite The site records grouped by site id
 * @param rootPath The path to the root of the data folder
 * @param poiRepository The poi repository
 */
const createSurveyPoints = async (
  siteEntities: Site[],
  dbIdToCSVId: Record<number, number>,
  recordsGroupedBySite: Dictionary<Coords[]>,
  rootPath: string,
  poiRepository: Repository<SiteSurveyPoint>,
) => {
  // Create site points of interest entities for each imported site
  // Final result needs to be flattened since the resulting array is grouped by site
  const surveyPoints = siteEntities
    .map((site) => {
      const currentSiteId = dbIdToCSVId[site.id];
      const siteFolder = FOLDER_PREFIX + currentSiteId;
      return recordsGroupedBySite[currentSiteId]
        .filter((record) => {
          const colonyId = record.colony.toString().padStart(3, '0');
          const colonyFolder = COLONY_FOLDER_PREFIX + colonyId;
          const colonyFolderPath = path.join(
            rootPath,
            siteFolder,
            colonyFolder,
          );

          return fs.existsSync(colonyFolderPath);
        })
        .map((record) => {
          const point: Point | undefined =
            !isNaN(record.long) && !isNaN(record.lat)
              ? createPoint(record.long, record.lat)
              : undefined;

          return {
            name: COLONY_PREFIX + record.colony,
            site,
            polygon: point,
          };
        });
    })
    .flat();

  logger.log('Saving site points of interest');
  const poiEntities = await Promise.all(
    surveyPoints.map((poi) =>
      poiRepository
        .save(poi)
        .catch(handleEntityDuplicate(poiRepository, poiQuery, poi.polygon)),
    ),
  );

  return poiEntities;
};

/**
 * Create source entities
 * @param poiEntities The created poi entities
 * @param sourcesRepository The sources repository
 */
const createSources = async (
  poiEntities: SiteSurveyPoint[],
  sourcesRepository: Repository<Sources>,
) => {
  // Create sources for each new poi
  const sources = poiEntities.map((poi) => {
    return {
      site: poi.site,
      poi,
      type: SourceType.HOBO,
    };
  });

  logger.log('Saving sources');
  const sourceEntities = await Promise.all(
    sources.map((source) =>
      sourcesRepository
        .findOne({
          relations: ['surveyPoint', 'site'],
          where: {
            site: { id: source.site.id },
            surveyPoint: { id: source.poi.id },
            type: source.type,
          },
        })
        .then((foundSource) => {
          if (foundSource) {
            return foundSource;
          }

          return sourcesRepository.save(source);
        }),
    ),
  );

  // Map surveyPoints to created sources. Hobo sources have a specified poi.
  return keyBy(sourceEntities, (o) => o.surveyPoint!.id);
};

/**
 * Parse hobo csv
 * @param poiEntities The created poi entities
 * @param dbIdToCSVId The reverse map (db.site.id => csv.site_id)
 * @param rootPath The path to the root of the data folder
 * @param poiToSourceMap A object to map surveyPoints to source entities
 * @param timeSeriesRepository The time series repository
 */
const parseHoboData = async (
  poiEntities: SiteSurveyPoint[],
  dbIdToCSVId: Record<number, number>,
  rootPath: string,
  poiToSourceMap: Dictionary<Sources>,
  timeSeriesRepository: Repository<TimeSeries>,
) => {
  // Parse hobo data
  const parsedData = poiEntities.map((poi) => {
    const colonyId = poi.name.split(' ')[1].padStart(3, '0');
    const dataFile = COLONY_DATA_FILE.replace('{}', colonyId);
    const colonyFolder = COLONY_FOLDER_PREFIX + colonyId;
    const siteFolder = FOLDER_PREFIX + dbIdToCSVId[poi.site.id];
    const filePath = path.join(rootPath, siteFolder, colonyFolder, dataFile);
    const headers = [undefined, 'id', 'dateTime', 'bottomTemperature'];
    const castFunction = castCsvValues(
      ['id'],
      ['bottomTemperature'],
      ['dateTime'],
    );
    return parseCSV<Data>(filePath, headers, castFunction).map((data) => ({
      timestamp: data.dateTime,
      value: data.bottomTemperature,
      source: poiToSourceMap[poi.id],
      metric: Metric.BOTTOM_TEMPERATURE,
    }));
  });

  // Find the earliest date of data
  const startDates = parsedData.reduce((acc, data) => {
    const minimum = minBy(data, (o) => o.timestamp);

    if (!minimum) {
      return acc;
    }

    return acc.concat(minimum);
  }, []);

  const groupedStartedDates = keyBy(startDates, (o) => o.source.site.id);

  // Start a backfill for each site
  const siteDiffDays: [number, number][] = Object.keys(groupedStartedDates).map(
    (siteId) => {
      const startDate = groupedStartedDates[siteId];
      if (!startDate) {
        return [parseInt(siteId, 10), 0];
      }

      const start = DateTime.fromJSDate(startDate.timestamp);
      const end = DateTime.now();
      const diff = Math.min(end.diff(start, 'days').days, 200);

      return [startDate.source.site.id, diff];
    },
  );

  const bottomTemperatureData = parsedData.flat();

  // Data are to much to added with one bulk insert
  // So we need to break them in batches
  const batchSize = 1000;
  logger.log(`Saving time series data in batches of ${batchSize}`);
  const inserts = chunk(bottomTemperatureData, batchSize).map((batch) => {
    return timeSeriesRepository
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

  return siteDiffDays;
};

/**
 * Upload site photos and create for each image a new survey and an associated survey media
 * As diveDate the creation date of the image will be used
 * @param poiEntities The create poi entities
 * @param dbIdToCSVId The reverse map (db.site.id => csv.site_id)
 * @param rootPath The path to the root of the data folder
 * @param googleCloudService The google cloud service instance
 * @param user A user to associate the surveys with
 * @param surveyRepository The survey repository
 * @param surveyMediaRepository The survey media repository
 */
const uploadSitePhotos = async (
  poiEntities: SiteSurveyPoint[],
  dbIdToCSVId: Record<number, number>,
  rootPath: string,
  googleCloudService: GoogleCloudService,
  user: User,
  surveyRepository: Repository<Survey>,
  surveyMediaRepository: Repository<SurveyMedia>,
) => {
  // Find and images and extract their metadata
  const imageData = poiEntities
    .map((poi) => {
      const colonyId = poi.name.split(' ')[1].padStart(3, '0');
      const colonyFolder = COLONY_FOLDER_PREFIX + colonyId;
      const siteFolder = FOLDER_PREFIX + dbIdToCSVId[poi.site.id];
      const colonyFolderPath = path.join(rootPath, siteFolder, colonyFolder);
      const contents = fs.readdirSync(colonyFolderPath);
      const images = contents.filter((f) => {
        const ext = path.extname(f).toLowerCase().replace('.', '');
        return validFiles.has(ext);
      });

      return images.map((image) => {
        const data = ExifParserFactory.create(
          fs.readFileSync(path.join(colonyFolderPath, image)),
        ).parse();
        const createdDate =
          data.tags && data.tags.CreateDate
            ? DateTime.fromSeconds(data.tags.CreateDate).toJSDate()
            : DateTime.now().toJSDate();
        return {
          imagePath: path.join(colonyFolderPath, image),
          site: poi.site,
          poi,
          createdDate,
        };
      });
    })
    .flat();

  logger.log('Upload photos to google cloud');
  const imageLength = imageData.length;
  const surveyMedia = await Bluebird.each(
    imageData.map((image) =>
      googleCloudService
        .uploadFileSync(image.imagePath, 'image')
        .then((url) => {
          const survey = {
            site: image.site,
            user,
            diveDate: image.createdDate,
            weatherConditions: WeatherConditions.NoData,
          };

          return surveyRepository.save(survey).then((surveyEntity) => {
            return {
              url,
              featured: true,
              hidden: false,
              type: MediaType.Image,
              surveyPoint: image.poi,
              surveyId: surveyEntity,
              metadata: JSON.stringify({}),
              observations: Observations.NoData,
            };
          });
        }),
    ),
    (data, idx) => {
      logger.log(`${idx + 1} images uploaded out of ${imageLength}`);
      return data;
    },
  );

  logger.log('Saving survey media');
  await surveyMediaRepository.save(surveyMedia);
};

export const performBackfill = (
  siteDiffDays: [number, number][],
  dataSource: DataSource,
) => {
  siteDiffDays.forEach(([siteId, diff]) => {
    logger.log(`Performing backfill for site ${siteId} for ${diff} days`);
    backfillSiteData({
      siteId,
      days: diff,
      dataSource,
    });
  });
};

// Upload hobo data
// Returns a object with keys the db site ids and values the corresponding imported site ids
export const uploadHoboData = async (
  rootPath: string,
  email: string,
  googleCloudService: GoogleCloudService,
  repositories: Repositories,
  dataSource: DataSource,
): Promise<Record<string, number>> => {
  // Grab user and check if they exist
  const user = await repositories.userRepository.findOne({
    where: { email: email.toLowerCase() },
    relations: ['administeredSites'],
  });

  if (!user) {
    logger.error(`No user was found with email ${email}`);
    throw new BadRequestException('User was not found');
  }

  const siteSet = fs
    .readdirSync(rootPath)
    .filter((f) => {
      // File must be directory and be in Patch_Site_{site_id} format
      return (
        fs.statSync(path.join(rootPath, f)).isDirectory() &&
        f.includes(FOLDER_PREFIX)
      );
    })
    .map((siteFolder) => {
      return parseInt(siteFolder.replace(FOLDER_PREFIX, ''), 10);
    });

  const dataAsJson = readCoordsFile(rootPath, siteSet);

  const { recordsGroupedBySite, sites } = await getSiteRecords(
    dataAsJson,
    siteSet,
    repositories.regionRepository,
  );

  const { siteEntities, dbIdToCSVId } = await createSites(
    sites,
    user,
    repositories.siteRepository,
    repositories.userRepository,
    repositories.historicalMonthlyMeanRepository,
  );

  const poiEntities = await createSurveyPoints(
    siteEntities,
    dbIdToCSVId,
    recordsGroupedBySite,
    rootPath,
    repositories.surveyPointRepository,
  );

  const poiToSourceMap = await createSources(
    poiEntities,
    repositories.sourcesRepository,
  );

  const surveyPointsGroupedBySite = groupBy(poiEntities, (poi) => poi.site.id);

  const siteDiffArray = await Bluebird.map(
    Object.values(surveyPointsGroupedBySite),
    (surveyPoints) =>
      parseHoboData(
        surveyPoints,
        dbIdToCSVId,
        rootPath,
        poiToSourceMap,
        repositories.timeSeriesRepository,
      ),
    { concurrency: 1 },
  );

  await Bluebird.map(
    Object.values(surveyPointsGroupedBySite),
    (surveyPoints) =>
      uploadSitePhotos(
        surveyPoints,
        dbIdToCSVId,
        rootPath,
        googleCloudService,
        user,
        repositories.surveyRepository,
        repositories.surveyMediaRepository,
      ),
    { concurrency: 1 },
  );

  performBackfill(siteDiffArray.flat(), dataSource);

  // Update materialized view
  refreshMaterializedView(repositories.dataUploadsRepository);

  return dbIdToCSVId;
};
