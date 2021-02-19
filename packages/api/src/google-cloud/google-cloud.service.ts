import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Storage } from '@google-cloud/storage';
import { Repository } from 'typeorm';
import path from 'path';
import { SurveyMedia } from '../surveys/survey-media.entity';
import { getFileFromURL } from '../utils/google-cloud.utils';

@Injectable()
export class GoogleCloudService {
  private logger = new Logger('GCS');
  private storage: Storage;

  private readonly GCS_BUCKET = process.env.GCS_BUCKET;
  private readonly STORAGE_FOLDER = process.env.STORAGE_FOLDER;
  private readonly GCS_KEYFILE = process.env.GCS_KEYFILE;
  private readonly GCS_PROJECT = process.env.GCS_PROJECT;

  constructor(
    @InjectRepository(SurveyMedia)
    private surveyMediaRepository: Repository<SurveyMedia>,
  ) {
    this.storage = new Storage({
      autoRetry: true,
      keyFilename: this.GCS_KEYFILE,
      projectId: this.GCS_PROJECT,
      maxRetries: 3,
    });
  }

  public async uploadFile(filePath: string, type: string): Promise<string> {
    if (!this.GCS_BUCKET || !this.STORAGE_FOLDER) {
      this.logger.error(
        'GCS_BUCKET or STORAGE_FOLDER variable has not been initialized',
      );
      throw new InternalServerErrorException();
    }
    const ext = path.extname(filePath);
    const basename = path.basename(filePath).replace(ext, '');
    const randomString = Array(16)
      .fill(null)
      .map(() => Math.round(Math.random() * 15).toString(16))
      .join('');
    const destination = `${this.STORAGE_FOLDER}/surveys/${basename}-${type}-${randomString}`;
    const response = await this.storage
      .bucket(this.GCS_BUCKET)
      .upload(filePath, {
        destination,
        public: true,
        gzip: true,
      });
    const publicUrl = response[0].baseUrl;

    if (!publicUrl) {
      this.logger.error('Google cloud did not return any url');
      return '';
    }

    return publicUrl;
  }

  public async findDanglingFiles(): Promise<string[]> {
    if (!this.GCS_BUCKET || !this.STORAGE_FOLDER) {
      this.logger.error(
        'GCS_BUCKET or STORAGE_FOLDER variable has not been initialized',
      );
      throw new InternalServerErrorException();
    }

    const surveyMedia = await this.surveyMediaRepository.find({
      select: ['url'],
    });

    const mediaSet = new Set(
      surveyMedia.map((media) => getFileFromURL(media.url)),
    );

    const fileResponse = await this.storage
      .bucket(this.GCS_BUCKET)
      .getFiles({ directory: this.STORAGE_FOLDER });

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
    if (!this.GCS_BUCKET) {
      this.logger.error('GCS_BUCKET variable has not been initialized');
      throw new InternalServerErrorException();
    }

    try {
      await this.storage.bucket(this.GCS_BUCKET).file(file).delete();
    } catch (error) {
      this.logger.error(`Failed to delete the file ${file}: `, error);
      throw new InternalServerErrorException();
    }
  }
}
