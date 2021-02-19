import { InjectRepository } from '@nestjs/typeorm';
import _, { groupBy, omit } from 'lodash';
import { Repository } from 'typeorm';
import { Injectable, Logger } from '@nestjs/common';
import unzipper from 'unzipper';
import fs from 'fs';
import path from 'path';
import xlsx from 'xlsx';
import { Point } from 'geojson';
import moment from 'moment';
import { ReefDataDto } from './dto/reef-data.dto';
import { PoiDataDto } from './dto/poi-data.dto';
import { DataRangeDto } from './dto/data-range.dto';
import { Reef } from '../reefs/reefs.entity';
import { ReefPointOfInterest } from '../reef-pois/reef-pois.entity';
import { Metric, Metrics } from './metrics.entity';
import { TimeSeries } from './time-series.entity';

interface Coords {
  reef: number;
  colony: number;
  lat: number;
  long: number;
}

interface Data {
  id: number;
  timestamp: Date;
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

  async uploadHoboData(file: Express.Multer.File, aliases: [number, string][]) {
    const EXTRACT_PATH = 'data';
    const FOLDER_PREFIX = 'Patch_Reef_';
    const COLONY_COORDS_FILE = 'Colony_Coords.xlsx';
    const COLONY_FOLDER_PREFIX = 'Col_';
    const COLONY_PREFIX = 'Colony ';
    const COLONY_DATA_FILE = 'Col{}_FullHOBO.xlsx';
    const validFiles = new Set(['png', 'jpeg', 'jpg']);

    const directory = await unzipper.Open.buffer(file.buffer);
    await directory.extract({ path: EXTRACT_PATH });
    const rootPath = `${EXTRACT_PATH}/${directory.files[0].path.split('/')[0]}`;
    const reefIds = new Set<number>();

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

    const aliasesMap: { [k: number]: string } = Object.fromEntries(aliases);
    const aliasesToId = Object.fromEntries(
      aliases.map(([id, alias]) => [alias, id]),
    );

    const coordsFilePath = path.join(rootPath, COLONY_COORDS_FILE);
    const coordsHeaders = ['reef', 'colony', 'lat', 'long'];
    const dataAsJson = this.parseXLSX<Coords>(coordsFilePath, coordsHeaders);

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

    const reefEntities = await this.reefRepository.save(reefs);
    const dbIdToXLSXId = Object.fromEntries(
      reefEntities.map((reef) => {
        return [reef.id, aliasesToId[reef.name]];
      }),
    );

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

    const poiEntities = await this.poiRepository.save(pois);
    const metrics = await this.metricsRepository.find();
    const metricToMetrics = Object.fromEntries(
      metrics.map((metric) => [metric.metric.toString(), metric]),
    );

    const parsedData = poiEntities
      .map((poi) => {
        const colonyId = poi.name.split(' ')[1].padStart(3, '0');
        const dataFile = COLONY_DATA_FILE.replace('{}', colonyId);
        const colonyFolder = COLONY_FOLDER_PREFIX + colonyId;
        const reefFolder = FOLDER_PREFIX + dbIdToXLSXId[poi.reef.id];
        const filePath = path.join(
          rootPath,
          reefFolder,
          colonyFolder,
          dataFile,
        );
        const headers = ['id', 'dateTime', 'bottomTemperature'];
        return this.parseXLSX<Data>(filePath, headers).map((data) => ({
          ...data,
          timestamp: moment(data.timestamp).add(8, 'h').toDate(),
          reef: poi.reef,
          poi,
        }));
      })
      .flat();

    const bottomTemperatureData = parsedData.map((data) => ({
      timestamp: data.timestamp,
      value: data.bottomTemperature,
      reef: data.reef,
      poi: data.poi,
      metric: metricToMetrics[Metric.BOTTOM_TEMPERATURE],
    }));

    await this.timeSeriesRepository.save(bottomTemperatureData);

    // const metadata = filteredColonies.map((record) => {
    //   const colonyId = record.colony.toString().padStart(3, '0');
    //   const colonyFolder = COLONY_FOLDER_PREFIX + colonyId;
    //   const colonyFolderPath = path.join(rootPath, reefFolder, colonyFolder);
    //   const contents = fs.readdirSync(colonyFolderPath);
    //   const images = contents.filter((file) => {
    //     const ext = path.extname(file).toLowerCase().replace('.', '');
    //     console.log(ext);
    //     console.log(validFiles.keys());
    //     return validFiles.has(ext);
    //   });

    //   return images.map((image) => {
    //     const data = ExifParserFactory.create(
    //       fs.readFileSync(path.join(colonyFolderPath, image)),
    //     ).parse();
    //     return {
    //       image:
    //         data.tags &&
    //         data.tags.CreateDate &&
    //         moment.unix(data.tags.CreateDate),
    //     };
    //   });
    // });

    // logger.log(metadata);
  }
}
