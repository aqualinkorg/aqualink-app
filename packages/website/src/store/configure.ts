import { configureStore, getDefaultMiddleware } from "@reduxjs/toolkit";
import { persistStore, persistReducer, PERSIST } from "redux-persist";
import storage from "redux-persist/lib/storage";

/* eslint-disable-next-line import/no-cycle */
import reducer from "./reducer";

const persistConfig = {
  key: "aqualink-app-storage",
  storage,
  whitelist: ["user"],
};

const persistedReducer = persistReducer(persistConfig, reducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware({
    serializableCheck: {
      ignoredActions: [PERSIST],
    },
  }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;

export type CreateAsyncThunkTypes = {
  dispatch: AppDispatch;
  state: RootState;
  rejectValue: string;
};
