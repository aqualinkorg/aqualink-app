import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ReefCheckSurvey } from 'reef-check-surveys/reef-check-surveys.entity';
import { SiteSurveyPoint } from 'site-survey-points/site-survey-points.entity';
import { Site } from 'sites/sites.entity';
import { Survey } from 'surveys/surveys.entity';
import { Repository } from 'typeorm';

export class MetadataService {
  private readonly logger = new Logger(MetadataService.name);

  constructor(
    @InjectRepository(Site)
    private siteRepository: Repository<Site>,

    @InjectRepository(SiteSurveyPoint)
    private siteSurveyPointRepository: Repository<SiteSurveyPoint>,

    @InjectRepository(Survey)
    private surveyRepository: Repository<Survey>,

    @InjectRepository(ReefCheckSurvey)
    private reefCheckSurveyRepository: Repository<ReefCheckSurvey>,
  ) {}

  async getSites() {
    return this.siteRepository.find({ select: ['id', 'name'] });
  }

  async getSitePoints() {
    return this.siteSurveyPointRepository
      .createQueryBuilder()
      .select('id')
      .addSelect('site_id', 'siteId')
      .getRawMany<{ id: number; siteId: number }>();
  }

  async getSurveys() {
    return this.surveyRepository
      .createQueryBuilder()
      .select('id')
      .addSelect('site_id', 'siteId')
      .getRawMany<{ id: number; siteId: number }>();
  }

  async getReefCheckSurveys() {
    return this.reefCheckSurveyRepository
      .createQueryBuilder()
      .select('id')
      .addSelect('site_id', 'siteId')
      .getRawMany<{ id: string; siteId: number }>();
  }
}
