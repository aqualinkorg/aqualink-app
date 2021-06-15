import admin from 'firebase-admin';
import { DeepPartial } from 'typeorm';
import * as firebaseAuthStrategy from '../src/auth/firebase-auth.utils';

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

interface StateTrackable {
  createdAt?: DeepPartial<Date>;
}

export const convertGeneratedDateColumns = (entity: StateTrackable) => {
  return {
    ...(entity.createdAt
      ? { createdAt: (entity.createdAt as Date).toISOString() }
      : {}),
  };
};
