import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SiteSurveyPoint } from '../site-survey-points/site-survey-points.entity';
import { Site } from '../sites/sites.entity';
import { SurveyPointDataDto } from '../time-series/dto/survey-point-data.dto';
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

  async getDataUploads({ siteId, surveyPointId }: SurveyPointDataDto) {
    const site = await this.sitesRepository.findOne({ where: { id: siteId } });
    const surveyPoint = await this.surveyPointRepository.findOne({
      where: { id: surveyPointId },
    });
    const uploads = await this.dataUploadsRepository.find({
      where: { site, surveyPoint },
    });

    return uploads;
  }
}
