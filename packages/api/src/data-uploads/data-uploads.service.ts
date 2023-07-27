import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { SiteDataRangeDto } from '../time-series/dto/site-data-range.dto';
import { DataUploadsSites } from './data-uploads-sites.entity';
import { DataUploads } from './data-uploads.entity';
import { DataUploadsDeleteDto } from './dto/data-uploads-delete.dto';

@Injectable()
export class DataUploadsService {
  constructor(
    @InjectRepository(DataUploads)
    private dataUploadsRepository: Repository<DataUploads>,

    @InjectRepository(DataUploadsSites)
    private dataUploadsSitesRepository: Repository<DataUploadsSites>,
  ) {}

  async getDataUploads({ siteId }: SiteDataRangeDto) {
    return this.dataUploadsSitesRepository
      .createQueryBuilder('dataUploadsSites')
      .leftJoinAndSelect('dataUploadsSites.site', 'site')
      .leftJoinAndSelect('dataUploadsSites.dataUpload', 'dataUpload')
      .leftJoinAndSelect('dataUploadsSites.surveyPoint', 'surveyPoint')
      .where('dataUploadsSites.siteId = :siteId', { siteId })
      .getMany();
  }

  async deleteDataUploads({ ids }: DataUploadsDeleteDto) {
    await this.dataUploadsRepository.delete({ id: In(ids) });
  }
}
