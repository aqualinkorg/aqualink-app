import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SiteDataRangeDto } from '../time-series/dto/site-data-range.dto';
import { DataUploads } from './data-uploads.entity';

@Injectable()
export class DataUploadsService {
  constructor(
    @InjectRepository(DataUploads)
    private dataUploadsRepository: Repository<DataUploads>,
  ) {}

  async getDataUploads({ siteId }: SiteDataRangeDto) {
    const query = this.dataUploadsRepository
      .createQueryBuilder('data_uploads')
      .leftJoin('data_uploads.surveyPoint', 'site_survey_point')
      .addSelect(['site_survey_point.id', 'site_survey_point.name'])
      .andWhere('data_uploads.site_id = :site', {
        site: siteId,
      });

    return query.getMany();
  }
}
