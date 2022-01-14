import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SiteSurveyPoint } from '../site-survey-points/site-survey-points.entity';
import { Site } from '../sites/sites.entity';
import { SiteDataRangeDto } from '../time-series/dto/site-data-range.dto';
import { DataUploads } from './data-uploads.entity';

@Injectable()
export class DataUploadsService {
  constructor(
    @InjectRepository(DataUploads)
    private dataUploadsRepository: Repository<DataUploads>,

    @InjectRepository(Site)
    private sitesRepository: Repository<Site>,

    @InjectRepository(SiteSurveyPoint)
    private surveyPointRepository: Repository<SiteSurveyPoint>,
  ) {}

  async getDataUploads({ siteId }: SiteDataRangeDto) {
    const query = this.dataUploadsRepository
      .createQueryBuilder('data_uploads')
      .leftJoin('data_uploads.surveyPoint', 'site_survey_point')
      .addSelect(['site_survey_point.id', 'site_survey_point.name'])
      .orderBy('max_date', 'DESC')
      .andWhere('data_uploads.site_id = :site', {
        site: siteId,
      });

    return query.getMany();
  }
}
