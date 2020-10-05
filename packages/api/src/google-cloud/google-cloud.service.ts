import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Storage } from '@google-cloud/storage';
import { Repository } from 'typeorm';
import { SurveyMedia } from '../surveys/survey-media.entity';

@Injectable()
export class GoogleCloudService {
  private logger = new Logger('GCS');
  private storage: Storage;

  constructor(
    @InjectRepository(SurveyMedia)
    private surveyMediaRepository: Repository<SurveyMedia>,
  ) {
    this.storage = new Storage({
      autoRetry: true,
      keyFilename: process.env.GCS_KEYFILE,
      projectId: process.env.GCS_PROJECT,
      maxRetries: 3,
    });
  }

  public async findDanglingFiles(): Promise<string[]> {
    if (!process.env.GCS_BUCKET || !process.env.STORAGE_FOLDER) {
      this.logger.error(
        'GCS_BUCKET or STORAGE_FOLDER variable has not been initialized',
      );
      throw new InternalServerErrorException();
    }

    const surveyMedia = await this.surveyMediaRepository.find({
      select: ['url'],
    });

    const mediaSet = new Set(
      surveyMedia.map(
        (media) => media.url.split(`${process.env.GCS_BUCKET}/`)[1],
      ),
    );

    const fileResponse = await this.storage
      .bucket(process.env.GCS_BUCKET)
      .getFiles({ directory: process.env.STORAGE_FOLDER });

    return fileResponse[0]
      .filter((file) => !mediaSet.has(file.name))
      .map((file) => file.name);
  }

  public async deleteDanglingFiles(): Promise<void[]> {
    const danglingFiles = await this.findDanglingFiles();

    const actions = danglingFiles.map((file) => {
      return this.deleteFile(file).catch(() => {
        this.logger.log(`Could not delete media ${file}.`);
      });
    });

    return Promise.all(actions);
  }

  public async deleteFile(file: string) {
    if (!process.env.GCS_BUCKET) {
      this.logger.error('GCS_BUCKET variable has not been initialized');
      throw new InternalServerErrorException();
    }

    try {
      await this.storage.bucket(process.env.GCS_BUCKET).file(file).delete();
    } catch (error) {
      this.logger.error(`Failed to delete the file ${file}: `, error);
      throw new InternalServerErrorException();
    }
  }
}
