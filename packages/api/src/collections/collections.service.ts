import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { camelCase, isUndefined, keyBy, omitBy } from 'lodash';
import { In, Repository } from 'typeorm';
import { Collection, CollectionData } from './collections.entity';
import { DailyData } from '../reefs/daily-data.entity';
import { Sources, SourceType } from '../reefs/sources.entity';
import { LatestData } from '../time-series/latest-data.entity';
import { Metric } from '../time-series/metrics.entity';
import { User } from '../users/users.entity';
import { getSstAnomaly } from '../utils/liveData';
import { hasHoboDataSubQuery } from '../utils/reef.utils';
import { CollectionDataDto } from './dto/collection-data.dto';
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
  private logger: Logger = new Logger(CollectionsService.name);

  constructor(
    @InjectRepository(Collection)
    private collectionRepository: Repository<Collection>,

    @InjectRepository(LatestData)
    private latestDataRepository: Repository<LatestData>,

    @InjectRepository(DailyData)
    private dailyDataRepository: Repository<DailyData>,

    @InjectRepository(Sources)
    private sourcesRepository: Repository<Sources>,
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
    user?: User,
  ): Promise<Collection[]> {
    const { name, reefId } = filterCollectionDto;

    const query = this.collectionRepository.createQueryBuilder('collection');

    if (user) {
      query.andWhere('collection.user_id = :userId', { userId: user.id });
    } else {
      query.andWhere('collection.is_public = TRUE');
    }

    if (name) {
      query.andWhere('collection.name = :name', { name });
    }

    if (reefId) {
      query
        .innerJoin('collection.reefs', 'reef')
        .andWhere('reef.id = :reefId', { reefId });
    }

    return query.getMany();
  }

  async findOne(
    collectionId: number,
    publicOnly: boolean = false,
  ): Promise<Collection> {
    const collection = await this.collectionRepository.findOne({
      where: { id: collectionId },
      relations: [
        'reefs',
        'reefs.historicalMonthlyMean',
        'reefs.region',
        'user',
      ],
    });

    if (!collection) {
      throw new NotFoundException(
        `Collection with ID ${collectionId} not found.`,
      );
    }

    if (publicOnly && !collection.isPublic) {
      throw new ForbiddenException(
        `You are not allowed to access this collection with ${collectionId}`,
      );
    }

    if (collection.reefs.length === 0) {
      return collection;
    }

    return this.getCollectionData(collection);
  }

  async update(collectionId: number, updateCollectionDto: UpdateCollectionDto) {
    const collection = await this.collectionRepository.findOne(collectionId);

    if (!collection) {
      throw new NotFoundException(
        `Collection with ID ${collectionId} not found.`,
      );
    }

    const {
      name,
      isPublic,
      userId,
      addReefIds,
      removeReefIds,
    } = updateCollectionDto;

    const filteredAddReefIds = addReefIds?.filter(
      (reefId) => !collection.reefIds.includes(reefId),
    );

    await this.collectionRepository
      .createQueryBuilder('collection')
      .relation('reefs')
      .of(collection)
      .addAndRemove(filteredAddReefIds || [], removeReefIds || []);

    await this.collectionRepository.update(
      {
        id: collectionId,
      },
      {
        ...omitBy({ name, isPublic }, isUndefined),
        ...(userId !== undefined ? { user: { id: userId } } : {}),
      },
    );

    return this.collectionRepository.findOne(collection.id);
  }

  async delete(collectionId: number) {
    const result = await this.collectionRepository.delete(collectionId);

    if (!result.affected) {
      throw new NotFoundException(
        `Collection with ID ${collectionId} not found.`,
      );
    }
  }

  private async getCollectionData(collection: Collection): Promise<Collection> {
    // Get buoy data
    const latestData = await this.latestDataRepository.find({
      where: {
        reef: In(collection.reefs.map((reef) => reef.id)),
        source: SourceType.SPOTTER,
        metric: In([Metric.BOTTOM_TEMPERATURE, Metric.TOP_TEMPERATURE]),
      },
    });

    const mappedlatestData = latestData.reduce<
      Record<number, Record<'bottomTemperature' | 'topTemperature', number>>
    >((acc, data) => {
      return {
        ...acc,
        [data.reefId]: {
          ...acc[data.reefId],
          [camelCase(data.metric)]: data.value,
        },
      };
    }, {});

    // Get latest sst and degree_heating days
    // Query builder doesn't apply correctly the select and DISTINCT must be first
    // So we use a raw query to achieve this
    const latestDailyData: LatestDailyData[] = await this.dailyDataRepository
      .createQueryBuilder('dailyData')
      .select(
        'DISTINCT ON (reef_id) reef_id AS id, satellite_temperature sst, degree_heating_days dhd, weekly_alert_level alert, date',
      )
      .where('reef_id IN (:...reefIds)', {
        reefIds: collection.reefs.map((reef) => reef.id),
      })
      .orderBy('reef_id, date', 'DESC')
      .getRawMany();

    const mappedLatestDailyData: Record<number, LatestDailyData> = keyBy(
      latestDailyData,
      'id',
    );

    const mappedReefData = collection.reefs.reduce<
      Record<number, CollectionDataDto>
    >((acc, reef) => {
      const sstValue = mappedLatestDailyData[reef.id]?.sst;
      const sst =
        sstValue || sstValue === 0
          ? {
              value: sstValue,
              timestamp: mappedLatestDailyData[reef.id].date,
            }
          : undefined;

      return {
        ...acc,
        [reef.id]: {
          ...mappedlatestData[reef.id],
          satelliteTemperature: mappedLatestDailyData[reef.id]?.sst,
          degreeHeatingDays: mappedLatestDailyData[reef.id]?.dhd,
          weeklyAlertLevel: mappedLatestDailyData[reef.id]?.alert,
          sstAnomaly: getSstAnomaly(reef.historicalMonthlyMean, sst),
        },
      };
    }, {});

    const hasHoboData = await hasHoboDataSubQuery(this.sourcesRepository);

    return {
      ...collection,
      user: {
        ...collection.user,
        firebaseUid: undefined,
      },
      reefs: collection.reefs.map((reef) => {
        return {
          ...reef,
          hasHobo: hasHoboData.has(reef.id),
          applied: reef.applied,
          collectionData: mappedReefData[reef.id],
        };
      }),
    };
  }
}
