import {
  createAsyncThunk,
  createSlice,
  PayloadAction,
} from "@reduxjs/toolkit";

import type { RootState } from "../configure";
import reefServices from "../../services/reefServices";
import { Site, SitesListState } from "../Sites/types";

const getReefsList = createAsyncThunk(
  "reefsList/getList",
  async (_: void, { rejectWithValue }) => {
    try {
      const { data } = await reefServices.getSitesList();
      return data;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

const getReefsDailyData = createAsyncThunk(
  "reefsList/getDailyData",
  async (date: string, { rejectWithValue }) => {
    try {
      const { data } = await reefServices.getSitesWithDailyData(date);
      return data;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

const reefsListInitialState: SitesListState = {
  list: [],
  loading: false,
  error: null,
  reefOnMap: null,
};

const reefsListSlice = createSlice({
  name: "reefsList",
  initialState: reefsListInitialState,
  reducers: {
    setReefOnMap: (state, action: PayloadAction<Site | null>) => {
      state.reefOnMap = action.payload;
    },
    clearReefOnMap: (state) => {
      state.reefOnMap = null;
    },
  },
  extraReducers: (builder) => {
    // getReefsList
    builder.addCase(getReefsList.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(getReefsList.fulfilled, (state, action) => {
      state.loading = false;
      state.list = action.payload;
    });
    builder.addCase(getReefsList.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
    // getReefsDailyData
    builder.addCase(getReefsDailyData.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(getReefsDailyData.fulfilled, (state, action) => {
      state.loading = false;
      state.list = action.payload;
    });
    builder.addCase(getReefsDailyData.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const { setReefOnMap, clearReefOnMap } = reefsListSlice.actions;

// Selectors
export const reefListSelector = (state: RootState): Site[] =>
  state.reefsList.list;
export const reefLoadingSelector = (state: RootState): boolean =>
  state.reefsList.loading;
export const reefErrorSelector = (state: RootState): string | null =>
  state.reefsList.error;
export const reefOnMapSelector = (state: RootState): Site | null =>
  state.reefsList.reefOnMap;

export { getReefsList, getReefsDailyData };

export default reefsListSlice.reducer;
