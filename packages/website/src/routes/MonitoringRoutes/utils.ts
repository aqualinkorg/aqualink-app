import { OptionsObject, SnackbarKey, SnackbarMessage } from 'notistack';
import React from 'react';
import { User } from 'store/User/types';

interface FetchDataProps<T> {
  user: User | null;
  enqueueSnackbar: (
    message: SnackbarMessage,
    options?: OptionsObject | undefined,
  ) => SnackbarKey;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setResult: React.Dispatch<React.SetStateAction<T | null>>;
  getResult: (token: string) => Promise<T>;
}

export async function fetchData<T>({
  user,
  enqueueSnackbar,
  setLoading,
  setResult,
  getResult,
}: FetchDataProps<T>) {
  const { token } = user || {};
  if (!token) {
    enqueueSnackbar('User is not authenticated!', {
      variant: 'error',
    });
    return;
  }

  setResult(null);

  setLoading(true);
  try {
    const data = await getResult(token);

    setResult(data);
  } catch (error: any) {
    const message = error?.response?.data?.message;
    const errorMessage =
      typeof message === 'object' ? message?.join('. ') : message;
    enqueueSnackbar(errorMessage || 'Request failed', {
      variant: 'error',
    });
  } finally {
    setLoading(false);
  }
}

export const includes = (
  a: string | undefined | null,
  b: string | undefined,
) => {
  if (!b?.trim()) return true;
  if (!a) return false;

  return a.toLocaleLowerCase().includes(b.toLocaleLowerCase());
};
