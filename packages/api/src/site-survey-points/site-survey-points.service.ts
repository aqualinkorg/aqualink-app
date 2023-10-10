import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GeoJSON } from 'geojson';
import { omit } from 'lodash';
import { SiteSurveyPoint } from './site-survey-points.entity';
import { CreateSiteSurveyPointDto } from './dto/create-survey-point.dto';
import { FilterSiteSurveyPointDto } from './dto/filter-survey-point.dto';
import { UpdateSiteSurveyPointDto } from './dto/update-survey-point.dto';
import { createPoint } from '../utils/coordinates';

@Injectable()
export class SiteSurveyPointsService {
  constructor(
    @InjectRepository(SiteSurveyPoint)
    private surveyPointsRepository: Repository<SiteSurveyPoint>,
  ) {}

  async create(
    createSiteSurveyPointDto: CreateSiteSurveyPointDto,
  ): Promise<SiteSurveyPoint> {
    const { latitude, longitude, siteId } = createSiteSurveyPointDto;

    const polygon: GeoJSON | undefined =
      longitude !== undefined && latitude !== undefined
        ? createPoint(longitude, latitude)
        : undefined;

    return this.surveyPointsRepository.save({
      ...createSiteSurveyPointDto,
      site: { id: siteId },
      polygon,
    });
  }

  async find(filter: FilterSiteSurveyPointDto): Promise<SiteSurveyPoint[]> {
    const query =
      this.surveyPointsRepository.createQueryBuilder('survey_point');
    if (filter.name) {
      query.andWhere('(lower(survey_point.name) LIKE :name)', {
        name: `%${filter.name.toLowerCase()}%`,
      });
    }
    if (filter.siteId) {
      query.andWhere('survey_point.site_id = :site', {
        site: filter.siteId,
      });
    }
    query.leftJoinAndSelect('survey_point.site', 'site');
    return query.getMany();
  }

  async findOne(id: number): Promise<SiteSurveyPoint> {
    const found = await this.surveyPointsRepository.findOne({
      where: { id },
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
    updateSiteSurveyPointDto: UpdateSiteSurveyPointDto,
  ): Promise<SiteSurveyPoint> {
    const { latitude, longitude, siteId } = updateSiteSurveyPointDto;
    const polygon: { polygon: GeoJSON } | {} =
      longitude !== undefined && latitude !== undefined
        ? {
            polygon: createPoint(longitude, latitude),
          }
        : {};
    const updateSite = siteId !== undefined ? { site: { id: siteId } } : {};

    const result = await this.surveyPointsRepository.update(id, {
      ...omit(updateSiteSurveyPointDto, 'longitude', 'latitude', 'siteId'),
      ...updateSite,
      ...polygon,
    });

    if (!result.affected) {
      throw new NotFoundException(
        `Site Point of Interest with ID ${id} not found.`,
      );
    }

    const updated = await this.surveyPointsRepository.findOneBy({ id });

    return updated!;
  }

  async delete(id: number): Promise<void> {
    const result = await this.surveyPointsRepository.delete(id);
    if (!result.affected) {
      throw new NotFoundException(
        `Site Point of Interest with ID ${id} not found.`,
      );
    }
  }
}
