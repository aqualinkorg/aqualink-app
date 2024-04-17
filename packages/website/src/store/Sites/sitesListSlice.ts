import { sortBy } from 'lodash';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { setSiteNameFromList, sitesFilterFn } from 'helpers/siteUtils';
import { getAxiosErrorMessage } from 'helpers/errors';
import siteServices from 'services/siteServices';
import type {
  siteOptions,
  SitesListState,
  SitesRequestData,
  UpdateSiteNameFromListArgs,
} from './types';
import type { CreateAsyncThunkTypes, RootState } from '../configure';

const sitesListInitialState: SitesListState = {
  loading: false,
  error: null,
};

export const sitesRequest = createAsyncThunk<
  SitesRequestData,
  undefined,
  CreateAsyncThunkTypes
>(
  'sitesList/request',
  async (arg, { rejectWithValue, getState }) => {
    try {
      const { data } = await siteServices.getSites();
      const {
        homepage: { siteFilter },
      } = getState();
      const sortedData = sortBy(data, 'name');
      const transformedData = sortedData.map((item) => ({
        ...item,
        collectionData: item.collectionData || {},
      }));
      return {
        list: transformedData,
        sitesToDisplay: transformedData.filter((s) =>
          sitesFilterFn(siteFilter, s),
        ),
      };
    } catch (err) {
      return rejectWithValue(getAxiosErrorMessage(err));
    }
  },
  {
    condition(arg: undefined, { getState }) {
      const {
        sitesList: { list },
      } = getState();
      return !list;
    },
  },
);

const sitesListSlice = createSlice({
  name: 'sitesList',
  initialState: sitesListInitialState,
  reducers: {
    filterSitesWithSpotter: (
      state,
      action: PayloadAction<typeof siteOptions[number]>,
    ) => ({
      ...state,
      sitesToDisplay: state.list?.filter((s) =>
        sitesFilterFn(action.payload, s),
      ),
    }),
    setSiteName: (
      state,
      action: PayloadAction<UpdateSiteNameFromListArgs>,
    ) => ({
      ...state,
      list: setSiteNameFromList(action.payload),
    }),
  },
  extraReducers: (builder) => {
    builder.addCase(
      sitesRequest.fulfilled,
      (state, action: PayloadAction<SitesRequestData>) => {
        return {
          ...state,
          list: action.payload.list,
          sitesToDisplay: action.payload.sitesToDisplay,
          loading: false,
        };
      },
    );

    builder.addCase(sitesRequest.rejected, (state, action) => {
      return {
        ...state,
        error: action.error.message
          ? action.error.message
          : action.error.toString(),
        loading: false,
      };
    });

    builder.addCase(sitesRequest.pending, (state) => {
      return {
        ...state,
        loading: true,
        error: null,
      };
    });
  },
});

export const sitesListSelector = (state: RootState): SitesListState['list'] =>
  state.sitesList.list;

export const sitesToDisplayListSelector = (
  state: RootState,
): SitesListState['sitesToDisplay'] => state.sitesList.sitesToDisplay;

export const sitesListLoadingSelector = (
  state: RootState,
): SitesListState['loading'] => state.sitesList.loading;

export const sitesListErrorSelector = (
  state: RootState,
): SitesListState['error'] => state.sitesList.error;

export const { filterSitesWithSpotter, setSiteName } = sitesListSlice.actions;

export default sitesListSlice.reducer;
