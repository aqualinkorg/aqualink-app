import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { isUndefined, omitBy } from 'lodash';
import { Repository, MoreThanOrEqual, In } from 'typeorm';
import { Collection, DynamicCollection } from './collections.entity';
import { Sources } from '../sites/sources.entity';
import { LatestData } from '../time-series/latest-data.entity';
import { AdminLevel, User } from '../users/users.entity';
import { hasHoboDataSubQuery } from '../utils/site.utils';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { FilterCollectionDto } from './dto/filter-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';
import {
  getCollectionData,
  heatStressTracker,
} from '../utils/collections.utils';
import { Site } from '../sites/sites.entity';
import { Metric } from '../time-series/metrics.enum';

@Injectable()
export class CollectionsService {
  private logger: Logger = new Logger(CollectionsService.name);

  constructor(
    @InjectRepository(Collection)
    private collectionRepository: Repository<Collection>,

    @InjectRepository(LatestData)
    private latestDataRepository: Repository<LatestData>,

    @InjectRepository(Site)
    private siteRepository: Repository<Site>,

    @InjectRepository(Sources)
    private sourcesRepository: Repository<Sources>,
  ) {}

  create(
    createCollectionDto: CreateCollectionDto,
    user?: User,
  ): Promise<Collection> {
    const { name, isPublic, siteIds, userId: idFromDTO } = createCollectionDto;

    // Users who are not admins can only create collections for themselves
    if (
      idFromDTO &&
      idFromDTO !== user?.id &&
      user?.adminLevel !== AdminLevel.SuperAdmin
    ) {
      throw new ForbiddenException(
        'You are not allowed to execute this operation',
      );
    }

    const userId = idFromDTO || user?.id;

    const sites = siteIds.map((siteId) => ({ id: siteId }));
    return this.collectionRepository.save({
      name,
      isPublic,
      sites,
      user: { id: userId },
    });
  }

  find(
    filterCollectionDto: FilterCollectionDto,
    user?: User,
  ): Promise<Collection[]> {
    const { name, siteId } = filterCollectionDto;

    const query = this.collectionRepository.createQueryBuilder('collection');

    if (user) {
      query.andWhere('collection.user_id = :userId', { userId: user.id });
    } else {
      query.andWhere('collection.is_public = TRUE');
    }

    if (name) {
      query.andWhere('collection.name = :name', { name });
    }

    if (siteId) {
      query
        .innerJoin('collection.sites', 'site')
        .andWhere('site.id = :siteId', { siteId });
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
        'sites',
        'sites.historicalMonthlyMean',
        'sites.region',
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

    if (collection.sites.length === 0) {
      return collection;
    }

    return this.processCollection(collection, collection.sites);
  }

  async update(collectionId: number, updateCollectionDto: UpdateCollectionDto) {
    const collection = await this.collectionRepository.findOneBy({
      id: collectionId,
    });

    if (!collection) {
      throw new NotFoundException(
        `Collection with ID ${collectionId} not found.`,
      );
    }

    const { name, isPublic, userId, addSiteIds, removeSiteIds } =
      updateCollectionDto;

    const filteredAddSiteIds = addSiteIds?.filter(
      (siteId) => !collection.siteIds.includes(siteId),
    );

    await this.collectionRepository
      .createQueryBuilder('collection')
      .relation('sites')
      .of(collection)
      .addAndRemove(filteredAddSiteIds || [], removeSiteIds || []);

    await this.collectionRepository.update(
      {
        id: collectionId,
      },
      {
        ...omitBy({ name, isPublic }, isUndefined),
        ...(userId !== undefined ? { user: { id: userId } } : {}),
      },
    );

    return this.collectionRepository.findOneBy({ id: collection!.id });
  }

  async delete(collectionId: number) {
    const result = await this.collectionRepository.delete(collectionId);

    if (!result.affected) {
      throw new NotFoundException(
        `Collection with ID ${collectionId} not found.`,
      );
    }
  }

  async getHeatStressTracker() {
    const heatStressData = await this.latestDataRepository.findBy({
      metric: Metric.DHW,
      value: MoreThanOrEqual(1),
    });

    const heatStressSiteIds = heatStressData.map((data) => data.siteId);

    const heatStressSites = await this.siteRepository.find({
      where: { id: In(heatStressSiteIds), display: true },
    });

    return this.processCollection(heatStressTracker, heatStressSites);
  }

  private async processCollection<T extends DynamicCollection | Collection>(
    collection: T,
    sites: Site[],
  ): Promise<T> {
    const mappedSiteData = await getCollectionData(
      sites,
      this.latestDataRepository,
    );

    const hasHoboData = await hasHoboDataSubQuery(this.sourcesRepository);

    return {
      ...collection,
      user:
        collection instanceof Collection
          ? {
              ...collection.user,
              firebaseUid: undefined,
            }
          : undefined,
      siteIds: sites.map((site) => site.id),
      sites: sites.map((site) => ({
        ...site,
        hasHobo: hasHoboData.has(site.id),
        applied: site.applied,
        collectionData: mappedSiteData[site.id],
      })),
    };
  }
}
