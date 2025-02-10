import { configureStore } from '@reduxjs/toolkit';

import reducer from './reducer';
import { appMiddlewares } from './middleware';

export const store = configureStore({
  reducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().prepend(appMiddlewares),
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;

export type CreateAsyncThunkTypes = {
  dispatch: AppDispatch;
  state: RootState;
  rejectValue: string;
};
