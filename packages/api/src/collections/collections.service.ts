import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { isUndefined, keyBy, omitBy } from 'lodash';
import { In, Repository } from 'typeorm';
import { DailyData } from '../reefs/daily-data.entity';
import { SourceType } from '../reefs/sources.entity';
import { LatestData } from '../time-series/latest-data.entity';
import { Metric } from '../time-series/metrics.entity';
import { User } from '../users/users.entity';
import { getSstAnomaly } from '../utils/liveData';
import { SofarValue } from '../utils/sofar.types';
import { metricToKey } from '../utils/time-series.utils';
import { Collection, CollectionData } from './collections.entity';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { FilterCollectionDto } from './dto/filter-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';

interface LatestDailyData {
  // reefId
  id: number;
  date: string;
  // satelliteTemperature
  sst?: number;
  // degreeHeatingStress
  dhd?: number;
  // weekly alert
  alert?: number;
}

@Injectable()
export class CollectionsService {
  private logger: Logger = new Logger(CollectionsService.name, true);

  constructor(
    @InjectRepository(Collection)
    private collectionRepository: Repository<Collection>,

    @InjectRepository(LatestData)
    private latestDataRepository: Repository<LatestData>,

    @InjectRepository(DailyData)
    private dailyDataRepository: Repository<DailyData>,
  ) {}

  create(createCollectionDto: CreateCollectionDto): Promise<Collection> {
    const { name, isPublic, reefIds, userId } = createCollectionDto;

    const reefs = reefIds.map((reefId) => ({ id: reefId }));
    return this.collectionRepository.save({
      name,
      isPublic,
      reefs,
      user: { id: userId },
    });
  }

  find(
    filterCollectionDto: FilterCollectionDto,
    user: User,
  ): Promise<Collection[]> {
    const { name, isPublic, reefId } = filterCollectionDto;

    const query = this.collectionRepository.createQueryBuilder('collection');

    if (name) {
      query.andWhere('collection.name = :name', { name });
    }

    if (isPublic && isPublic === 'true') {
      query.andWhere('collection.is_public = TRUE');
    } else if (!isPublic || isPublic === 'false') {
      query.andWhere('collection.is_public = FALSE');
      query.andWhere('collection.user_id = :userId', { userId: user.id });
    }

    if (reefId) {
      query
        .innerJoin('collection.reefs', 'reef')
        .andWhere('reef.reef_id = :reefId', { reefId });
    }

    return query.getMany();
  }

  async findOne(collectionId: number): Promise<Collection> {
    const collection = await this.collectionRepository.findOne({
      where: { id: collectionId },
      relations: ['reefs', 'reefs.historicalMonthlyMean'],
    });

    if (!collection) {
      throw new NotFoundException(
        `Collection with ID ${collectionId} not found.`,
      );
    }

    // Get buoy data
    const latestData = await this.latestDataRepository.find({
      where: {
        reef: In(collection.reefs.map((reef) => reef.id)),
        source: SourceType.SPOTTER,
        metric: In([Metric.BOTTOM_TEMPERATURE, Metric.TOP_TEMPERATURE]),
      },
    });

    const mappedlatestData = latestData.reduce((obj, data) => {
      return {
        ...obj,
        [data.reefId]: {
          ...obj[data.reefId],
          [metricToKey(data.metric)]: data.value,
        },
      };
    }, {}) as Record<
      number,
      Record<'bottomTemperature' | 'topTemperature', SofarValue>
    >;

    this.logger.log('Getting latest daily data');
    // Get latest sst and degree_heating days
    // Query builder doesn't apply correctly the select and DISTINCT must be first
    // So we use a raw query to achieve this
    const latestDailyData: LatestDailyData[] = await this.dailyDataRepository
      .createQueryBuilder('dailyData')
      .select(
        'DISTINCT ON (reef_id) reef_id AS id, satellite_temperature sst, degree_heating_days dhd, weekly_alert_level alert, date',
      )
      .orderBy('reef_id, date', 'DESC')
      .getRawMany();
    this.logger.log('Got latest daily data');

    const mappedLatestDailyData: Record<number, LatestDailyData> = keyBy(
      latestDailyData,
      'id',
    );

    const mappedReefData = collection.reefs.reduce((obj, reef) => {
      const sst =
        mappedLatestDailyData[reef.id] &&
        mappedLatestDailyData[reef.id].sst !== undefined
          ? ({
              value: mappedLatestDailyData[reef.id].sst,
              timestamp: mappedLatestDailyData[reef.id].date,
            } as SofarValue)
          : undefined;

      return {
        ...obj,
        [reef.id]: {
          ...mappedlatestData[reef.id],
          satelliteTemperature: mappedLatestDailyData[reef.id]?.sst,
          degreeHeatingDays: mappedLatestDailyData[reef.id]?.dhd,
          weeklyAlert: mappedLatestDailyData[reef.id]?.alert,
          sstAnomaly: getSstAnomaly(reef.historicalMonthlyMean, sst),
        },
      };
    }, {}) as Record<number, CollectionData>;

    return {
      ...collection,
      reefs: collection.reefs.map((reef) => {
        return {
          ...reef,
          applied: reef.applied,
          collectionData: mappedReefData[reef.id],
        };
      }),
    };
  }

  async update(collectionId: number, updateCollectionDto: UpdateCollectionDto) {
    const collection = await this.collectionRepository.findOne(collectionId);

    if (!collection) {
      throw new NotFoundException(
        `Collection with ID ${collectionId} not found.`,
      );
    }
    const { name, isPublic, userId, reefIds } = updateCollectionDto;

    const reefs = reefIds && reefIds.map((reefId) => ({ id: reefId }));
    await this.collectionRepository.save({
      id: collectionId,
      ...omitBy({ name, isPublic }, isUndefined),
      reefs,
      user: userId === undefined ? undefined : { id: userId },
    });
  }

  async delete(collectionId: number) {
    const result = await this.collectionRepository.delete(collectionId);

    if (!result.affected) {
      throw new NotFoundException(
        `Collection with ID ${collectionId} not found.`,
      );
    }
  }
}
