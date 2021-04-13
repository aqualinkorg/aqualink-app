import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { isUndefined, omitBy } from 'lodash';
import { Repository } from 'typeorm';
import { Reef } from '../reefs/reefs.entity';
import { Collection } from './collections.entity';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { FilterCollectionDto } from './dto/filter-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';

@Injectable()
export class CollectionsService {
  private logger: Logger = new Logger(CollectionsService.name);

  constructor(
    @InjectRepository(Collection)
    private collectionRepository: Repository<Collection>,

    @InjectRepository(Reef)
    private reefRepository: Repository<Reef>,
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

  find(filterCollectionDto: FilterCollectionDto): Promise<Collection[]> {
    const { name, isPublic, reefId, userId } = filterCollectionDto;

    const query = this.collectionRepository.createQueryBuilder('collection');

    if (name) {
      query.andWhere('collection.name = :name', { name });
    }

    if (isPublic) {
      query.andWhere('collection.is_public = :isPublic', {
        isPublic: isPublic === 'true',
      });
    }

    if (userId) {
      query.andWhere('collection.user_id = :userId', { userId });
    }

    if (reefId) {
      query
        .innerJoin('collection.reefs', 'reef')
        .andWhere('reef.reef_id = :reefId', { reefId });
    }

    return query.getMany();
  }

  findOne(collectionId: number): Promise<Collection | undefined> {
    return this.collectionRepository.findOne(collectionId);
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
