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
    enqueueSnackbar(error?.response?.data?.message || 'Request failed', {
      variant: 'error',
    });
  } finally {
    setLoading(false);
  }
}
