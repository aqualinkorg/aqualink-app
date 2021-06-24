import { INestApplication } from '@nestjs/common';
import admin from 'firebase-admin';
import * as firebaseAuthStrategy from '../src/auth/firebase-auth.utils';
import { SurveysService } from '../src/surveys/surveys.service';

export const mockExtractAndVerifyToken = (
  firebaseUser: admin.auth.DecodedIdToken | undefined,
) => {
  jest
    .spyOn(firebaseAuthStrategy, 'extractAndVerifyToken')
    .mockImplementationOnce(async () => firebaseUser);
};

export const createMockFirebaseUser = (
  uid: string,
  email: string,
): admin.auth.DecodedIdToken => ({
  aud: 'aud',
  auth_time: 123,
  exp: 123,
  firebase: {
    identities: {},
    sign_in_provider: 'none',
  },
  iat: 123,
  iss: 'iss',
  email,
  sub: 'sub',
  uid,
});

export const mockDeleteFile = (app: INestApplication) => {
  const surveysService = app.get(SurveysService);

  jest
    .spyOn(surveysService.googleCloudService, 'deleteFile')
    .mockImplementation((props: string) => Promise.resolve());
};

export const mockDeleteFileFalling = (app: INestApplication) => {
  const surveysService = app.get(SurveysService);

  jest
    .spyOn(surveysService.googleCloudService, 'deleteFile')
    .mockImplementation((props: string) =>
      Promise.reject(new Error('Delete file failed')),
    );
};
