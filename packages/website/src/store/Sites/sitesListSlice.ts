import sortBy from 'lodash/sortBy';
import {
  createAsyncThunk,
  createSelector,
  createSlice,
  PayloadAction,
} from '@reduxjs/toolkit';
import {
  filterOutFalsy,
  filterSiteByHeatStress,
  filterSiteByImpact,
  filterSiteByReefComposition,
  filterSiteBySensorData as filterSiteBySiteOptions,
  filterSiteBySpecies,
  setSiteNameFromList,
} from 'helpers/siteUtils';
import { getAxiosErrorMessage } from 'helpers/errors';
import siteServices from 'services/siteServices';
import type {
  PatchSiteFiltersPayload,
  SiteFilters,
  SitesListState,
  SitesRequestData,
  UpdateSiteNameFromListArgs,
} from './types';
import type { CreateAsyncThunkTypes, RootState } from '../configure';

const sitesListInitialState: SitesListState = {
  loading: false,
  error: null,
  filters: {},
};

export const sitesRequest = createAsyncThunk<
  SitesRequestData,
  undefined,
  CreateAsyncThunkTypes
>(
  'sitesList/request',
  async (arg, { rejectWithValue }) => {
    try {
      const { data } = await siteServices.getSites();
      const sortedData = sortBy(data, 'name');
      const transformedData = sortedData.map((item) => ({
        ...item,
        collectionData: item.collectionData || {},
      }));
      return {
        list: transformedData,
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
    patchSiteFilters: (
      state: SitesListState,
      {
        payload: { category, filter, value },
      }: PayloadAction<{
        category: keyof SiteFilters;
        filter: string;
        value: boolean;
      }>,
    ) => ({
      ...state,
      filters: {
        ...state.filters,
        [category]: filterOutFalsy({
          ...state.filters?.[category],
          [filter]: value,
        }),
      },
    }),
    clearSiteFilters: (state: SitesListState) => ({
      ...state,
      filters: {},
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

export const sitesToDisplayListSelector = createSelector(
  sitesListSelector,
  (state: RootState) => state.sitesList.filters,
  (list, filters) =>
    list?.filter((s) => {
      return [
        filterSiteByHeatStress(s, filters),
        filterSiteBySiteOptions(s, filters),
        filterSiteBySpecies(s, filters),
        filterSiteByReefComposition(s, filters),
        filterSiteByImpact(s, filters),
      ].every(Boolean);
    }),
);

export const sitesListFiltersSelector = (
  state: RootState,
): SitesListState['filters'] => state.sitesList.filters;

export const sitesListLoadingSelector = (
  state: RootState,
): SitesListState['loading'] => state.sitesList.loading;

export const sitesListErrorSelector = (
  state: RootState,
): SitesListState['error'] => state.sitesList.error;

export const { clearSiteFilters, setSiteName } = sitesListSlice.actions;

// Re-export to keep function as generic
export const patchSiteFilters = sitesListSlice.actions.patchSiteFilters as <
  T extends keyof SiteFilters,
>(
  action: PatchSiteFiltersPayload<T>,
) => PayloadAction<PatchSiteFiltersPayload<T>>;

export default sitesListSlice.reducer;
