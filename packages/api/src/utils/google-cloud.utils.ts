import { InternalServerErrorException } from '@nestjs/common';

const GCS_BUCKET =
  process.env.GCS_BUCKET || (process.env.NODE_ENV === 'test' && 'storage');

export enum GoogleCloudDir {
  SURVEYS = 'surveys',
  DATA_UPLOADS = 'data_uploads',
}

export const getSurveyMediaFileFromURL = (url: string) => {
  if (!GCS_BUCKET) {
    throw new InternalServerErrorException('GCS_BUCKET variable is not set');
  }

  return url.split(`${GCS_BUCKET}/`)[1];
};
