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

  async getDataUploads({
    siteId,
  }: SiteDataRangeDto): Promise<DataUploadsSites[]> {
    const uploadsData = await this.dataUploadsSitesRepository
      .createQueryBuilder('dataUploadsSites')
      .leftJoinAndSelect('dataUploadsSites.site', 'site')
      .leftJoinAndSelect('dataUploadsSites.dataUpload', 'dataUpload')
      .leftJoinAndSelect('dataUploadsSites.surveyPoint', 'surveyPoint')
      .where('dataUploadsSites.siteId = :siteId', { siteId })
      .getMany();

    const otherSiteRelations = await this.dataUploadsSitesRepository
      .createQueryBuilder('dus')
      .select(['dus.site_id', 'dus2.site_id', 'dus.data_upload_id'])
      .innerJoin(
        'data_uploads_sites',
        'dus2',
        'dus.data_upload_id = dus2.data_upload_id',
      )
      .where('dus.site_id = :siteId', { siteId })
      .getRawMany();

    const groupedByDataUploadId = otherSiteRelations.reduce(
      (acc: Map<number, number[]>, cur) => {
        const uploadId = cur.data_upload_id;
        const id = cur.site_id;
        const val = acc.get(uploadId);
        acc.set(uploadId, val ? [...val, id] : [id]);
        return acc;
      },
      new Map<number, number[]>(),
    );

    return uploadsData.map((x) => ({
      ...x,
      sitesAffectedByDataUpload: groupedByDataUploadId.get(x.dataUploadId),
    }));
  }

  async deleteDataUploads({ ids }: DataUploadsDeleteDto) {
    await this.dataUploadsRepository.delete({ id: In(ids) });
  }
}
