import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reef } from './reefs.entity';
import { CreateReefDto } from './dto/create-reef.dto';
import { FilterReefDto } from './dto/filter-reef.dto';
import { UpdateReefDto } from './dto/update-reef.dto';

@Injectable()
export class ReefsService {
  constructor(
    @InjectRepository(Reef)
    private reefsRepository: Repository<Reef>,
  ) {}

  async create(createReefDto: CreateReefDto): Promise<Reef> {
    return this.reefsRepository.save(createReefDto);
  }

  async find(filter: FilterReefDto): Promise<Reef[]> {
    const query = this.reefsRepository.createQueryBuilder('reef');
    if (filter.name) {
      query.andWhere('(lower(reef.name) LIKE :name)', {
        name: `%${filter.name.toLowerCase()}%`,
      });
    }
    if (filter.status) {
      query.andWhere('reef.status = :status', { status: filter.status });
    }
    if (filter.region) {
      query.andWhere('reef.region = :region', {
        region: filter.region,
      });
    }
    if (filter.admin) {
      query.andWhere('reef.admin = :admin', {
        admin: filter.admin,
      });
    }
    query.leftJoinAndSelect('reef.region', 'region');
    query.leftJoinAndSelect('reef.admin', 'admin');
    query.leftJoinAndSelect('reef.stream', 'stream');
    return query.getMany();
  }

  async findOne(id: number): Promise<Reef> {
    const found = await this.reefsRepository.findOne(id, {
      relations: ['region', 'admin', 'stream'],
    });
    if (!found) {
      throw new NotFoundException(`Reef with ID ${id} not found.`);
    }
    return found;
  }

  async update(id: number, updateReefDto: UpdateReefDto) {
    const result = await this.reefsRepository.update(id, updateReefDto);
    if (!result.affected) {
      throw new NotFoundException(`Reef with ID ${id} not found.`);
    }
  }

  async delete(id: number): Promise<void> {
    const result = await this.reefsRepository.delete(id);
    if (!result.affected) {
      throw new NotFoundException(`Reef with ID ${id} not found.`);
    }
  }
}
