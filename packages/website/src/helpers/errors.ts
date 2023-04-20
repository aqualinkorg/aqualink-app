import { AxiosError } from 'axios';
import { FirebaseError } from 'firebase/app';
import { get } from 'lodash';

export const getAxiosErrorMessage = (err: unknown) =>
  (get((err as AxiosError)?.response?.data, 'message') as string | undefined) ||
  'Something went wrong';

export const getFirebaseErrorMessage = (err: unknown) =>
  (err as FirebaseError)?.message || 'Something went wrong with firebase';
