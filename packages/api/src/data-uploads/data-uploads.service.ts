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
    return this.dataUploadsRepository
      .createQueryBuilder('data_uploads')
      .innerJoin('data_uploads.sites', 'sites', 'sites.id = :siteId', {
        siteId,
      })
      .orderBy('data_uploads.max_date', 'DESC')
      .getMany();
  }

  async deleteDataUploads({ ids }: DataUploadsDeleteDto) {
    await this.dataUploadsRepository.delete({ id: In(ids) });
  }
}
