import { InjectRepository } from '@nestjs/typeorm';
import _, { chunk, groupBy, minBy, omit } from 'lodash';
import { Repository } from 'typeorm';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import unzipper from 'unzipper';
import fs from 'fs';
import path from 'path';
import xlsx from 'xlsx';
import { Point } from 'geojson';
import moment from 'moment';
import Bluebird from 'bluebird';
import { ExifParserFactory } from 'ts-exif-parser';
import { ReefDataDto } from './dto/reef-data.dto';
import { PoiDataDto } from './dto/poi-data.dto';
import { DataRangeDto } from './dto/data-range.dto';
import { Reef } from '../reefs/reefs.entity';
import { ReefPointOfInterest } from '../reef-pois/reef-pois.entity';
import { Metric, Metrics } from './metrics.entity';
import { TimeSeries } from './time-series.entity';
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

@Injectable()
export class TimeSeriesService {
  private logger = new Logger(TimeSeriesService.name);

  private readonly metricsObject = Object.values(Metric).reduce(
    (obj, key) => ({ ...obj, [key]: [] }),
    {},
  );

  constructor(
    @InjectRepository(Reef)
    private reefRepository: Repository<Reef>,

    @InjectRepository(ReefPointOfInterest)
    private poiRepository: Repository<ReefPointOfInterest>,

    @InjectRepository(Metrics)
    private metricsRepository: Repository<Metrics>,

    @InjectRepository(TimeSeries)
    private timeSeriesRepository: Repository<TimeSeries>,

    @InjectRepository(User)
    private userRepository: Repository<User>,

    @InjectRepository(Survey)
    private surveyRepository: Repository<Survey>,

    @InjectRepository(SurveyMedia)
    private surveyMediaRepository: Repository<SurveyMedia>,

    @InjectRepository(Sources)
    private sourcesRepository: Repository<Sources>,

    private googleCloudService: GoogleCloudService,
  ) {}

  private groupByMetric(data: any[]) {
    return _(data)
      .groupBy('metric')
      .mapValues((groupedData) => {
        return groupedData.map((o) => omit(o, 'metric'));
      })
      .merge(this.metricsObject);
  }

  async findPoiData(
    startDate: Date,
    endDate: Date,
    metrics: Metric[],
    poiDataDto: PoiDataDto,
  ) {
    const { reefId, poiId } = poiDataDto;

    const data = await this.timeSeriesRepository
      .createQueryBuilder('time_series')
      .select('value')
      .addSelect('metric')
      .addSelect('timestamp')
      .andWhere('metric IN (:...metrics)', { metrics })
      .andWhere('reef_id = :reefId', { reefId })
      .andWhere('poi_id = :poiId', { poiId })
      .andWhere('timestamp >= :startDate', { startDate })
      .andWhere('timestamp <= :endDate', { endDate })
      .orderBy('timestamp', 'ASC')
      .getRawMany();

    return this.groupByMetric(data);
  }

  async findReefData(
    startDate: Date,
    endDate: Date,
    metrics: Metric[],
    reefDataDto: ReefDataDto,
  ) {
    const { reefId } = reefDataDto;

    const data = await this.timeSeriesRepository
      .createQueryBuilder('time_series')
      .select('value')
      .addSelect('metric')
      .addSelect('timestamp')
      .andWhere('metric IN (:...metrics)', { metrics })
      .andWhere('reef_id = :reefId', { reefId })
      .andWhere('poi_id is NULL')
      .andWhere('timestamp >= :startDate', { startDate })
      .andWhere('timestamp <= :endDate', { endDate })
      .orderBy('timestamp', 'ASC')
      .getRawMany();

    return this.groupByMetric(data);
  }

  async findDataRange(dataRangeDto: DataRangeDto) {
    const { reefId, poiId } = dataRangeDto;

    const data = await this.timeSeriesRepository
      .createQueryBuilder('time_series')
      .select('metric')
      .addSelect('MIN(timestamp)', 'minDate')
      .addSelect('MAX(timestamp)', 'maxDate')
      .andWhere('reef_id = :reefId', { reefId })
      .andWhere('poi_id = :poiId', { poiId })
      .groupBy('metric')
      .getRawMany();

    return this.groupByMetric(data);
  }

  private parseXLSX<T>(
    filePath: string,
    header: string[],
    range: number = 1,
  ): T[] {
    const workbook = xlsx.readFile(filePath, { cellDates: true });
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    return xlsx.utils.sheet_to_json(firstSheet, { header, range });
  }

  async uploadHoboData(
    file: Express.Multer.File,
    aliases: [number, string][],
    email: string,
  ) {
    const EXTRACT_PATH = 'data';
    const FOLDER_PREFIX = 'Patch_Reef_';
    const COLONY_COORDS_FILE = 'Colony_Coords.xlsx';
    const COLONY_FOLDER_PREFIX = 'Col_';
    const COLONY_PREFIX = 'Colony ';
    const COLONY_DATA_FILE = 'Col{}_FullHOBO.xlsx';
    const validFiles = new Set(['png', 'jpeg', 'jpg']);

    // Grab user and check if they exist
    const user = await this.userRepository.findOne({
      where: { email },
      relations: ['administeredReefs'],
    });

    if (!user) {
      this.logger.error(`No user was found with email ${email}`);
      throw new BadRequestException('User was not found');
    }

    // Read and extract zip file
    const directory = await unzipper.Open.buffer(file.buffer);
    await directory.extract({ path: EXTRACT_PATH });
    // Main folder can be found by just getting the first folder of the path of any file in the zip archive
    const rootPath = `${EXTRACT_PATH}/${directory.files[0].path.split('/')[0]}`;
    const reefIds = new Set<number>();

    // Check that all reefs to be uploaded exist and add the ids to a set for quicker search
    aliases.forEach(([reefId, props]) => {
      const reefFolder = FOLDER_PREFIX + reefId;
      const reefFolderPath = path.join(rootPath, reefFolder);
      const exists = fs.existsSync(reefFolderPath);
      if (!exists) {
        this.logger.log(`Data folder for reef ${reefId} does not exist.`);
        return;
      }
      reefIds.add(reefId);
    });

    // Create object from aliases array and also the reverse object (id -> alias, alias -> id)
    const aliasesMap: { [k: number]: string } = Object.fromEntries(aliases);
    const aliasesToId = Object.fromEntries(
      aliases.map(([id, alias]) => [alias, id]),
    );

    // Read coords file
    const coordsFilePath = path.join(rootPath, COLONY_COORDS_FILE);
    const coordsHeaders = ['reef', 'colony', 'lat', 'long'];
    const dataAsJson = this.parseXLSX<Coords>(
      coordsFilePath,
      coordsHeaders,
    ).filter((record) => {
      return reefIds.has(record.reef);
    });

    // Group by reef
    const recordsGroupedByReef = groupBy(dataAsJson, 'reef');
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

    this.logger.log('Saving reefs');
    const reefEntities = await this.reefRepository.save(reefs);
    const dbIdToXLSXId = Object.fromEntries(
      reefEntities.map((reef) => {
        return [reef.id, aliasesToId[reef.name]];
      }),
    );
    await this.userRepository.save({
      id: user.id,
      administeredReefs: user.administeredReefs.concat(reefEntities),
    });

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
            return {
              name: COLONY_PREFIX + record.colony,
              reef,
            };
          });
      })
      .flat();

    this.logger.log('Saving reef points of interest');
    const poiEntities = await this.poiRepository.save(pois);

    const sources = poiEntities.map((poi) => {
      return {
        reef: poi.reef,
        poi,
        type: SourceType.HOBO,
      };
    });

    this.logger.log('Saving sources');
    const sourceEntities = await this.sourcesRepository.save(sources);
    const poiToSourceMap = Object.fromEntries(
      sourceEntities.map((source) => {
        return [source.poi.id, source];
      }),
    );

    const parsedData = poiEntities.map((poi) => {
      const colonyId = poi.name.split(' ')[1].padStart(3, '0');
      const dataFile = COLONY_DATA_FILE.replace('{}', colonyId);
      const colonyFolder = COLONY_FOLDER_PREFIX + colonyId;
      const reefFolder = FOLDER_PREFIX + dbIdToXLSXId[poi.reef.id];
      const filePath = path.join(rootPath, reefFolder, colonyFolder, dataFile);
      const headers = ['id', 'dateTime', 'bottomTemperature'];
      return this.parseXLSX<Data>(filePath, headers).map((data) => ({
        ...data,
        timestamp: moment(data.dateTime).add(8, 'h').toDate(),
        reef: poi.reef,
        poi,
        source: poiToSourceMap[poi.id],
      }));
    });

    const startDates = parsedData.reduce((acc, data) => {
      const minimum = minBy(data, (o) => o.timestamp);

      if (!minimum) {
        return acc;
      }

      return acc.concat([minimum]);
    }, []);

    const groupedStartedDates = groupBy(startDates, (o) => o.reef.id);

    Object.keys(groupedStartedDates).forEach((reefId) => {
      const startDate = minBy(groupedStartedDates[reefId], (o) => o.timestamp);
      if (!startDate) {
        return;
      }

      const start = moment(startDate.timestamp);
      const end = moment();
      const diff = end.diff(start, 'd');
      this.logger.log(
        `Performing backfill for reef ${startDate.reef.id} for ${diff} days`,
      );
      backfillReefData(startDate.reef.id, diff);
    });

    const bottomTemperatureData = parsedData.flat().map((data) => ({
      timestamp: data.timestamp,
      value: data.bottomTemperature,
      reef: data.reef,
      poi: data.poi,
      source: data.source,
      metric: Metric.BOTTOM_TEMPERATURE,
    }));

    const batchSize = 1000;
    this.logger.log(`Saving time series data in batches of ${batchSize}`);
    const inserts = chunk(bottomTemperatureData, batchSize).map((batch) => {
      return this.timeSeriesRepository.save(batch);
    });

    const actionsLength = inserts.length;
    await Bluebird.Promise.each(inserts, (props, idx) => {
      this.logger.log(`Saved ${idx + 1} out of ${actionsLength} batches`);
    });

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

    const surveys = imageData.map((image) => ({
      reef: image.reef,
      userId: user,
      diveDate: image.createdDate,
      weatherConditions: WeatherConditions.NoData,
    }));

    this.logger.log('Saving surveys');
    const surveyEntities = await this.surveyRepository.save(surveys);

    this.logger.log('Upload photos to google cloud');
    const imageLength = imageData.length;
    const uploadedImageData = await Bluebird.Promise.each(
      imageData.map((image) =>
        this.googleCloudService
          .uploadFile(image.imagePath, 'image')
          .then((url) => {
            const foundSurvey = surveyEntities.find((survey) => {
              return (
                survey.reef.id === image.reef.id &&
                survey.diveDate.getTime() === image.createdDate.getTime()
              );
            });

            if (!foundSurvey) {
              this.logger.error(
                `Could not match photo ${image.imagePath} to any survey`,
              );
            }

            return {
              ...image,
              url,
              survey: foundSurvey,
            };
          }),
      ),
      (data, idx) => {
        this.logger.log(`${idx + 1} images uploaded out of ${imageLength}`);
        return data;
      },
    );

    const surveyMedia = uploadedImageData
      .filter((image) => image.survey)
      .map((image) => ({
        url: image.url,
        featured: true,
        hidden: false,
        type: MediaType.Image,
        poiId: image.poi,
        survey: image.survey,
        metadata: JSON.stringify({}),
        observations: Observations.NoData,
      }));

    this.logger.log('Saving survey media');
    await this.surveyMediaRepository.save(surveyMedia);

    return dbIdToXLSXId;
  }
}
