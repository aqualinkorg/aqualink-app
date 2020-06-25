import { EntityRepository, Repository } from 'typeorm';
import { Region } from './regions.entity';
import { FilterRegionDto } from './dto/filter-region.dto';

@EntityRepository(Region)
export class RegionsRepository extends Repository<Region> {
  async filter(filter: FilterRegionDto): Promise<Region[]> {
    const query = this.createQueryBuilder('region');
    if (filter.name) {
      query.andWhere('(region.name LIKE :name)', { name: `%${filter.name}%` });
    }
    if (filter.parentId) {
      query.andWhere('region.parentId = :parentId', {
        parentId: filter.parentId,
      });
    }
    query.leftJoinAndSelect('region.parentId', 'parent');
    return query.getMany();
  }
}
