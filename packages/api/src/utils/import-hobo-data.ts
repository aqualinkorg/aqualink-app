import { chunk, Dictionary, groupBy, invert, keyBy, minBy } from 'lodash';
import { Repository } from 'typeorm';
import {
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import unzipper from 'unzipper';
import fs from 'fs';
import path from 'path';
import xlsx from 'xlsx';
import { Point } from 'geojson';
import moment from 'moment';
import Bluebird from 'bluebird';
import { ExifParserFactory } from 'ts-exif-parser';
import { Reef } from '../reefs/reefs.entity';
import { ReefPointOfInterest } from '../reef-pois/reef-pois.entity';
import { Metric } from '../time-series/metrics.entity';
import { TimeSeries } from '../time-series/time-series.entity';
import { User } from '../users/users.entity';
import { Survey, WeatherConditions } from '../surveys/surveys.entity';
import { GoogleCloudService } from '../google-cloud/google-cloud.service';
import {
  MediaType,
  Observations,
  SurveyMedia,
} from '../surveys/survey-media.entity';
import { Sources, SourceType } from '../reefs/sources.entity';
import { backfillReefData } from '../workers/backfill-reef-data';

interface Coords {
  reef: number;
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
  reefRepository: Repository<Reef>;
  poiRepository: Repository<ReefPointOfInterest>;
  timeSeriesRepository: Repository<TimeSeries>;
  userRepository: Repository<User>;
  surveyRepository: Repository<Survey>;
  surveyMediaRepository: Repository<SurveyMedia>;
  sourcesRepository: Repository<Sources>;
}

const EXTRACT_PATH = 'data';
const FOLDER_PREFIX = 'Patch_Reef_';
const COLONY_COORDS_FILE = 'Colony_Coords.xlsx';
const COLONY_FOLDER_PREFIX = 'Col_';
const COLONY_PREFIX = 'Colony ';
const COLONY_DATA_FILE = 'Col{}_FullHOBO.xlsx';
const validFiles = new Set(['png', 'jpeg', 'jpg']);

const logger = new Logger('ParseHoboData');

const parseXLSX = <T>(
  filePath: string,
  header: string[],
  range: number = 1,
): T[] => {
  const workbook = xlsx.readFile(filePath, { cellDates: true });
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
  return xlsx.utils.sheet_to_json(firstSheet, { header, range });
};

const parseAliases = (
  aliases: [number, string][],
  rootPath: string,
  reefIds: Set<number>,
) => {
  // Check that all reefs to be uploaded exist and add the ids to a set for quicker search
  aliases.forEach(([reefId, props]) => {
    const reefFolder = FOLDER_PREFIX + reefId;
    const reefFolderPath = path.join(rootPath, reefFolder);
    const exists = fs.existsSync(reefFolderPath);
    if (!exists) {
      logger.log(`Data folder for reef ${reefId} does not exist.`);
      return;
    }

    reefIds.add(reefId);
  });

  // Create object from aliases array and also the reverse object (id -> alias, alias -> id)
  const aliasesMap: Record<number, string> = Object.fromEntries(aliases);
  const aliasesToId = invert(aliasesMap);

  return { aliasesMap, aliasesToId };
};

const readCoordsFile = (rootPath: string, reefIds: Set<number>) => {
  // Read coords file
  const coordsFilePath = path.join(rootPath, COLONY_COORDS_FILE);
  const coordsHeaders = ['reef', 'colony', 'lat', 'long'];
  return parseXLSX<Coords>(coordsFilePath, coordsHeaders).filter((record) => {
    return reefIds.has(record.reef);
  });
};

const getReefRecords = (
  dataAsJson: Coords[],
  reefIds: Set<number>,
  aliasesMap: Record<number, string>,
) => {
  // Group by reef
  const recordsGroupedByReef = groupBy(dataAsJson, 'reef');

  // Extract reef entities and calculate position of reef by averaging all each pois positions
  const reefs = Array.from(reefIds).map((reefId) => {
    const filteredReefCoords = recordsGroupedByReef[reefId];

    const reefRecord = filteredReefCoords.reduce(
      (previous, record) => {
        return {
          ...previous,
          lat: previous.lat + record.lat,
          long: previous.long + record.long,
        };
      },
      { reef: reefId, colony: 0, lat: 0, long: 0 },
    );

    const point: Point = {
      type: 'Point',
      coordinates: [
        reefRecord.long / filteredReefCoords.length,
        reefRecord.lat / filteredReefCoords.length,
      ],
    };

    return {
      name: aliasesMap[reefId],
      polygon: point,
    };
  });

  return { recordsGroupedByReef, reefs };
};

const createReefs = async (
  reefs: Partial<Reef>[],
  user: User,
  reefRepository: Repository<Reef>,
  userRepository: Repository<User>,
  aliasesToId: Dictionary<string>,
) => {
  logger.log('Saving reefs');
  const reefEntities = await Promise.all(
    reefs.map((reef) => {
      return reefRepository.save(reef).catch((err) => {
        // Catch unique violation, i.e. there is already a reef at this location
        if (err.code === '23505') {
          return reefRepository
            .createQueryBuilder('reefs')
            .where(
              'reefs.polygon = ST_SetSRID(ST_GeomFromGeoJSON(:polygon), 4326)::geometry',
              { polygon: reef.polygon },
            )
            .getOne()
            .then((foundReef) => {
              if (!foundReef) {
                throw new InternalServerErrorException('Reef mismatch');
              }

              return foundReef;
            });
        }

        throw err;
      });
    }),
  );

  // Create reverse map (db.reef.id => xlsx.reef_id)
  const dbIdToXLSXId: Record<number, number> = Object.fromEntries(
    reefEntities.map((reef) => {
      return [reef.id, parseInt(aliasesToId[reef.name], 10)];
    }),
  );

  // Update administered reefs relationship
  await userRepository.save({
    id: user.id,
    administeredReefs: user.administeredReefs.concat(reefEntities),
  });

  return { reefEntities, dbIdToXLSXId };
};

const createPois = async (
  reefEntities: Reef[],
  dbIdToXLSXId: Record<number, number>,
  recordsGroupedByReef: Dictionary<Coords[]>,
  rootPath: string,
  poiRepository: Repository<ReefPointOfInterest>,
) => {
  // Create reef points of interest entities for each imported reef
  // Final result needs to be flattened since the resulting array is grouped by reef
  const pois = reefEntities
    .map((reef) => {
      const currentReefId = dbIdToXLSXId[reef.id];
      const reefFolder = FOLDER_PREFIX + currentReefId;
      return recordsGroupedByReef[currentReefId]
        .filter((record) => {
          const colonyId = record.colony.toString().padStart(3, '0');
          const colonyFolder = COLONY_FOLDER_PREFIX + colonyId;
          const colonyFolderPath = path.join(
            rootPath,
            reefFolder,
            colonyFolder,
          );

          return fs.existsSync(colonyFolderPath);
        })
        .map((record) => {
          const point: Point = {
            type: 'Point',
            coordinates: [record.long, record.lat],
          };

          return {
            name: COLONY_PREFIX + record.colony,
            reef,
            polygon: point,
          };
        });
    })
    .flat();

  logger.log('Saving reef points of interest');
  return poiRepository.save(pois);
};

const createSources = async (
  poiEntities: ReefPointOfInterest[],
  sourcesRepository: Repository<Sources>,
) => {
  // Create sources for each new poi
  const sources = poiEntities.map((poi) => {
    return {
      reef: poi.reef,
      poi,
      type: SourceType.HOBO,
    };
  });

  logger.log('Saving sources');
  const sourceEntities = await sourcesRepository.save(sources);
  // Map pois to created sources
  const poiToSourceMap = keyBy(sourceEntities, (o) => o.poi.id);

  return poiToSourceMap;
};

const parseHoboData = (
  poiEntities: ReefPointOfInterest[],
  dbIdToXLSXId: Record<number, number>,
  rootPath: string,
  poiToSourceMap: Dictionary<Sources>,
  timeSeriesRepository: Repository<TimeSeries>,
) => {
  // Parse hobo data
  const parsedData = poiEntities.map((poi) => {
    const colonyId = poi.name.split(' ')[1].padStart(3, '0');
    const dataFile = COLONY_DATA_FILE.replace('{}', colonyId);
    const colonyFolder = COLONY_FOLDER_PREFIX + colonyId;
    const reefFolder = FOLDER_PREFIX + dbIdToXLSXId[poi.reef.id];
    const filePath = path.join(rootPath, reefFolder, colonyFolder, dataFile);
    const headers = ['id', 'dateTime', 'bottomTemperature'];
    return parseXLSX<Data>(filePath, headers).map((data) => ({
      ...data,
      timestamp: moment(data.dateTime).add(8, 'h').toDate(),
      reef: poi.reef,
      poi,
      source: poiToSourceMap[poi.id],
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

  const groupedStartedDates = groupBy(startDates, (o) => o.reef.id);

  // Start a backfill for each reef
  Object.keys(groupedStartedDates).forEach((reefId) => {
    const startDate = minBy(groupedStartedDates[reefId], (o) => o.timestamp);
    if (!startDate) {
      return;
    }

    const start = moment(startDate.timestamp);
    const end = moment();
    const diff = Math.min(end.diff(start, 'd'), 200);
    logger.log(
      `Performing backfill for reef ${startDate.reef.id} for ${diff} days`,
    );
    backfillReefData(startDate.reef.id, diff);
  });

  // Grabs bottom temperature data
  const bottomTemperatureData = parsedData.flat().map((data) => ({
    timestamp: data.timestamp,
    value: data.bottomTemperature,
    reef: data.reef,
    poi: data.poi,
    source: data.source,
    metric: Metric.BOTTOM_TEMPERATURE,
  }));

  const batchSize = 1000;
  logger.log(`Saving time series data in batches of ${batchSize}`);
  const inserts = chunk(bottomTemperatureData, batchSize).map((batch) => {
    return timeSeriesRepository.save(batch);
  });

  const actionsLength = inserts.length;
  return Bluebird.Promise.each(inserts, (props, idx) => {
    logger.log(`Saved ${idx + 1} out of ${actionsLength} batches`);
  });
};

const uploadReefPhotos = async (
  poiEntities: ReefPointOfInterest[],
  dbIdToXLSXId: Record<number, number>,
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
      const reefFolder = FOLDER_PREFIX + dbIdToXLSXId[poi.reef.id];
      const colonyFolderPath = path.join(rootPath, reefFolder, colonyFolder);
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
            ? moment.unix(data.tags.CreateDate).toDate()
            : moment().toDate();
        return {
          imagePath: path.join(colonyFolderPath, image),
          reef: poi.reef,
          poi,
          createdDate,
        };
      });
    })
    .flat();

  logger.log('Upload photos to google cloud');
  const imageLength = imageData.length;
  const surveyMedia = await Bluebird.Promise.each(
    imageData.map((image) =>
      googleCloudService
        .uploadFile(image.imagePath, 'image')
        .then(async (url) => {
          const survey = {
            reef: image.reef,
            userId: user,
            diveDate: image.createdDate,
            weatherConditions: WeatherConditions.NoData,
          };

          const surveyEntity = await surveyRepository.save(survey);
          return {
            url,
            featured: true,
            hidden: false,
            type: MediaType.Image,
            poiId: image.poi,
            surveyId: surveyEntity,
            metadata: JSON.stringify({}),
            observations: Observations.NoData,
          };
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

export const uploadHoboData = async (
  file: Express.Multer.File,
  aliases: [number, string][],
  email: string,
  googleCloudService: GoogleCloudService,
  repositories: Repositories,
): Promise<Record<string, number>> => {
  // Grab user and check if they exist
  const user = await repositories.userRepository.findOne({
    where: { email },
    relations: ['administeredReefs'],
  });

  if (!user) {
    logger.error(`No user was found with email ${email}`);
    throw new BadRequestException('User was not found');
  }

  // Read and extract zip file
  const directory = await unzipper.Open.buffer(file.buffer);
  await directory.extract({ path: EXTRACT_PATH });
  // Main folder can be found by just getting the first folder of the path of any file in the zip archive
  const rootPath = `${EXTRACT_PATH}/${directory.files[0].path.split('/')[0]}`;
  const reefIds = new Set<number>();

  const { aliasesMap, aliasesToId } = parseAliases(aliases, rootPath, reefIds);

  const dataAsJson = readCoordsFile(rootPath, reefIds);

  const { recordsGroupedByReef, reefs } = getReefRecords(
    dataAsJson,
    reefIds,
    aliasesMap,
  );

  const { reefEntities, dbIdToXLSXId } = await createReefs(
    reefs,
    user,
    repositories.reefRepository,
    repositories.userRepository,
    aliasesToId,
  );

  const poiEntities = await createPois(
    reefEntities,
    dbIdToXLSXId,
    recordsGroupedByReef,
    rootPath,
    repositories.poiRepository,
  );

  const poiToSourceMap = await createSources(
    poiEntities,
    repositories.sourcesRepository,
  );

  await parseHoboData(
    poiEntities,
    dbIdToXLSXId,
    rootPath,
    poiToSourceMap,
    repositories.timeSeriesRepository,
  );

  await uploadReefPhotos(
    poiEntities,
    dbIdToXLSXId,
    rootPath,
    googleCloudService,
    user,
    repositories.surveyRepository,
    repositories.surveyMediaRepository,
  );

  return dbIdToXLSXId;
};
