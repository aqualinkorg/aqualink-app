import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Storage } from '@google-cloud/storage';
import { Repository } from 'typeorm';
import path from 'path';
import { getRandomName } from '../uploads/file.decorator';
import { DataUploads } from '../data-uploads/data-uploads.entity';
import {
  getSurveyMediaFileFromURL,
  GoogleCloudDir,
} from '../utils/google-cloud.utils';
import { SurveyMedia } from '../surveys/survey-media.entity';

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
    private surveyMediaRepository?: Repository<SurveyMedia>,

    @InjectRepository(DataUploads)
    private dataUploadsRepository?: Repository<DataUploads>,
  ) {
    this.storage = new Storage({
      keyFilename: this.GCS_KEYFILE,
      projectId: this.GCS_PROJECT,
      retryOptions: { autoRetry: true, maxRetries: 3 },
    });
  }

  private getDestination(
    filePath: string,
    type: string,
    dir: string,
    prefix: string,
  ): string {
    if (!this.STORAGE_FOLDER) {
      this.logger.error('STORAGE_FOLDER variable has not been initialized');
      throw new InternalServerErrorException();
    }
    const folder = `${this.STORAGE_FOLDER}/${dir}/`;
    const basename = path.basename(filePath);
    return getRandomName(folder, prefix, basename, type);
  }

  public uploadFileAsync(
    filePath: string,
    type: string,
    dir: string = 'surveys',
    prefix: string = 'site_hobo_image',
  ): string {
    const dest = this.getDestination(filePath, type, dir, prefix);
    this.uploadFile(filePath, dest);
    return dest;
  }

  public async uploadFileSync(
    filePath: string,
    type: string,
    dir: string = 'surveys',
    prefix: string = 'site_hobo_image',
  ): Promise<string> {
    const destination = this.getDestination(filePath, type, dir, prefix);
    return this.uploadFile(filePath, destination);
  }

  private async uploadFile(
    filePath: string,
    destination: string,
  ): Promise<string> {
    if (!this.GCS_BUCKET) {
      this.logger.error('GCS_BUCKET variable has not been initialized');
      throw new InternalServerErrorException();
    }
    const response = await this.storage
      .bucket(this.GCS_BUCKET)
      .upload(filePath, {
        destination,
        public: true,
        gzip: true,
      });

    const publicUrl = response[0].name;

    return `https://storage.googleapis.com/${this.GCS_BUCKET}/${publicUrl}`;
  }

  public uploadBuffer(
    buffer: Buffer,
    filePath: string,
    type: string,
    dir: string,
    prefix: string,
  ) {
    const dest = this.getDestination(filePath, type, dir, prefix);
    return this.uploadBufferToDestination(buffer, dest);
  }

  public async uploadBufferToDestination(
    buffer: Buffer,
    destination: string,
    bucket = this.GCS_BUCKET,
  ) {
    if (!bucket) {
      this.logger.error('GCS_BUCKET variable has not been initialized');
      throw new InternalServerErrorException();
    }
    const file = this.storage.bucket(bucket).file(destination);
    try {
      await file.save(buffer, { public: true, gzip: true });
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException();
    }
    return `https://storage.googleapis.com/${bucket}/${destination}`;
  }

  public async findDanglingFiles(): Promise<string[]> {
    if (!this.GCS_BUCKET || !this.STORAGE_FOLDER) {
      this.logger.error(
        'GCS_BUCKET or STORAGE_FOLDER variable has not been initialized',
      );
      throw new InternalServerErrorException();
    }

    if (!this.surveyMediaRepository || !this.dataUploadsRepository) {
      throw new InternalServerErrorException();
    }

    const surveyMedia = await this.surveyMediaRepository.find({
      select: ['url', 'thumbnailUrl'],
    });

    const dataUploads = await this.dataUploadsRepository.find({
      select: ['fileLocation'],
    });

    const originalMediaSet = new Set(
      surveyMedia.map((media) => getSurveyMediaFileFromURL(media.url)),
    );

    const thumbnailMediaSet = new Set(
      surveyMedia.map((media) =>
        getSurveyMediaFileFromURL(media.thumbnailUrl || ''),
      ),
    );

    const dataUploadsSet = new Set(dataUploads.map((x) => x.fileLocation));

    const [mediaFileResponse] = await this.storage
      .bucket(this.GCS_BUCKET)
      .getFiles({ prefix: `${this.STORAGE_FOLDER}/${GoogleCloudDir.SURVEYS}` });

    const [dataUploadsFileResponse] = await this.storage
      .bucket(this.GCS_BUCKET)
      .getFiles({
        prefix: `${this.STORAGE_FOLDER}/${GoogleCloudDir.DATA_UPLOADS}`,
      });

    const mediaFiltered = mediaFileResponse
      .filter((f) => !originalMediaSet.has(f.name))
      .filter((f) => !thumbnailMediaSet.has(f.name))
      .map((f) => f.name);

    const dataUploadsFiltered = dataUploadsFileResponse
      .filter((f) => !dataUploadsSet.has(f.name))
      .map((f) => f.name);

    return [...mediaFiltered, ...dataUploadsFiltered];
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
      this.logger.error(
        `Failed to delete the file ${file}: `,
        error as string | undefined,
      );
      throw new InternalServerErrorException();
    }
  }
}
