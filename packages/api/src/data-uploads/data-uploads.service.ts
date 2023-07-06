import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { SiteDataRangeDto } from '../time-series/dto/site-data-range.dto';
import { DataUploads } from './data-uploads.entity';
import { DataUploadsDeleteDto } from './dto/data-uploads-delete.dto';

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
      })
      .orderBy('data_uploads.max_date', 'DESC');

    return query.getMany();
  }

  async deleteDataUploads({ ids }: DataUploadsDeleteDto) {
    await this.dataUploadsRepository.delete({ id: In(ids) });
    this.dataUploadsRepository.query('REFRESH MATERIALIZED VIEW latest_data');
  }
}
