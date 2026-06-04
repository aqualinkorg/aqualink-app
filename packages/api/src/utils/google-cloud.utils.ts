import { InternalServerErrorException } from '@nestjs/common';

const { GCS_BUCKET } = process.env;

export enum GoogleCloudDir {
  SURVEYS = 'surveys',
  DATA_UPLOADS = 'data_uploads',
}

export const getSurveyMediaFileFromURL = (url: string) => {
  if (GCS_BUCKET) {
    const fileFromBucket = url.split(`${GCS_BUCKET}/`)[1];

    if (fileFromBucket) {
      return fileFromBucket;
    }
  }

  try {
    const { pathname } = new URL(url);
    const segments = pathname.replace(/^\/+/, '').split('/');

    if (segments.length > 1) {
      return segments.slice(1).join('/');
    }

    if (segments[0]) {
      return segments[0];
    }
  } catch {
    throw new InternalServerErrorException(
      'Could not derive survey media file path from URL',
    );
  }

  throw new InternalServerErrorException(
    'Could not derive survey media file path from URL',
  );
};
