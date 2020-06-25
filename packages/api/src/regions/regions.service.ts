import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Region } from './regions.entity';
import { RegionsRepository } from './regions.repository';
import { CreateRegionDto } from './dto/create-region.dto';
import { FilterRegionDto } from './dto/filter-region.dto';
import { UpdateRegionDto } from './dto/update-region.dto';

@Injectable()
export class RegionsService {
  constructor(
    @InjectRepository(RegionsRepository)
    private regionsRepository: RegionsRepository,
  ) {}

  async create(createRegionDto: CreateRegionDto): Promise<Region> {
    return this.regionsRepository.save(createRegionDto);
  }

  async find(filterRegionDto: FilterRegionDto): Promise<Region[]> {
    return this.regionsRepository.filter(filterRegionDto);
  }

  async findOne(id: number): Promise<Region> {
    const found = await this.regionsRepository.findOne(id);
    if (!found) {
      throw new NotFoundException(`Region with ID ${id} not found.`);
    }
    return found;
  }

  async update(id: number, updateRegionDto: UpdateRegionDto) {
    const result = await this.regionsRepository.update(id, updateRegionDto);
    if (!result.affected) {
      throw new NotFoundException(`Region with ID ${id} not found.`);
    }
  }

  async delete(id: number): Promise<void> {
    const result = await this.regionsRepository.delete(id);
    if (!result.affected) {
      throw new NotFoundException(`Region with ID ${id} not found.`);
    }
  }
}
