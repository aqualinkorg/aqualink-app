import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GeoJSON } from 'geojson';
import { omit } from 'lodash';
import { SitePointOfInterest } from './site-pois.entity';
import { CreateSitePoiDto } from './dto/create-site-poi.dto';
import { FilterSitePoiDto } from './dto/filter-site-poi.dto';
import { UpdateSitePoiDto } from './dto/update-site-poi.dto';
import { createPoint } from '../utils/coordinates';

@Injectable()
export class SitePoisService {
  constructor(
    @InjectRepository(SitePointOfInterest)
    private poisRepository: Repository<SitePointOfInterest>,
  ) {}

  async create(
    createSitePoiDto: CreateSitePoiDto,
  ): Promise<SitePointOfInterest> {
    const { latitude, longitude, siteId } = createSitePoiDto;

    const polygon: GeoJSON | undefined =
      longitude !== undefined && latitude !== undefined
        ? createPoint(longitude, latitude)
        : undefined;

    return this.poisRepository.save({
      ...createSitePoiDto,
      site: { id: siteId },
      polygon,
    });
  }

  async find(filter: FilterSitePoiDto): Promise<SitePointOfInterest[]> {
    const query = this.poisRepository.createQueryBuilder('poi');
    if (filter.name) {
      query.andWhere('(lower(poi.name) LIKE :name)', {
        name: `%${filter.name.toLowerCase()}%`,
      });
    }
    if (filter.siteId) {
      query.andWhere('poi.site_id = :site', {
        site: filter.siteId,
      });
    }
    query.leftJoinAndSelect('poi.site', 'site');
    return query.getMany();
  }

  async findOne(id: number): Promise<SitePointOfInterest> {
    const found = await this.poisRepository.findOne(id, {
      relations: ['site'],
    });
    if (!found) {
      throw new NotFoundException(
        `Site Point of Interest with ID ${id} not found.`,
      );
    }
    return found;
  }

  async update(
    id: number,
    updateSitePoiDto: UpdateSitePoiDto,
  ): Promise<SitePointOfInterest> {
    const { latitude, longitude, siteId } = updateSitePoiDto;
    const polygon: { polygon: GeoJSON } | {} =
      longitude !== undefined && latitude !== undefined
        ? {
            polygon: createPoint(longitude, latitude),
          }
        : {};
    const updateSite = siteId !== undefined ? { site: { id: siteId } } : {};

    const result = await this.poisRepository.update(id, {
      ...omit(updateSitePoiDto, 'longitude', 'latitude', 'siteId'),
      ...updateSite,
      ...polygon,
    });

    if (!result.affected) {
      throw new NotFoundException(
        `Site Point of Interest with ID ${id} not found.`,
      );
    }

    const updated = await this.poisRepository.findOne(id);

    return updated!;
  }

  async delete(id: number): Promise<void> {
    const result = await this.poisRepository.delete(id);
    if (!result.affected) {
      throw new NotFoundException(
        `Site Point of Interest with ID ${id} not found.`,
      );
    }
  }
}
