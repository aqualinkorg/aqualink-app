import sortBy from 'lodash/sortBy';
import {
  createAsyncThunk,
  createListenerMiddleware,
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
import {
  readFiltersFromUrl,
  readHistoricalDateFromUrl,
  writeFiltersToUrl,
  writeHistoricalDateToUrl,
} from './helpers';

const sitesListInitialState: SitesListState = {
  loading: false,
  error: null,
  filters: {},
  date: null,
};

export const sitesRequest = createAsyncThunk<
  SitesRequestData,
  undefined,
  CreateAsyncThunkTypes
>(
  'sitesList/request',
  async (arg, { getState, rejectWithValue }) => {
    // Sites are fetched for the selected historical date, or live when null
    const { date } = getState().sitesList;
    try {
      const { data } = await siteServices.getSites(date);
      const sortedData = sortBy(data, 'name');
      const transformedData = sortedData.map((item) => ({
        ...item,
        collectionData: item.collectionData || {},
      }));
      return {
        list: transformedData,
        date,
      };
    } catch (err) {
      return rejectWithValue(getAxiosErrorMessage(err));
    }
  },
  {
    condition(arg: undefined, { getState }) {
      const {
        sitesList: { list, listDate, date },
      } = getState();
      return !list || (listDate ?? null) !== date;
    },
  },
);

const sitesListSlice = createSlice({
  name: 'sitesList',
  initialState: () => ({
    ...sitesListInitialState,
    filters: readFiltersFromUrl(),
    date: readHistoricalDateFromUrl(),
  }),
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
    setSitesListDate: (
      state: SitesListState,
      action: PayloadAction<string | null>,
    ) => ({
      ...state,
      date: action.payload,
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
      (state, action: PayloadAction<SitesRequestData>) =>
        // Ignore responses for a date that is no longer selected
        // (the request for the selected date is still in flight)
        state.list && action.payload.date !== state.date
          ? state
          : {
              ...state,
              list: action.payload.list,
              listDate: action.payload.date,
              loading: false,
              refreshing: false,
            },
    );

    builder.addCase(sitesRequest.rejected, (state, action) => ({
      ...state,
      error: action.error.message
        ? action.error.message
        : action.error.toString(),
      loading: false,
      refreshing: false,
    }));

    // When switching dates, keep the current list (and the map) displayed
    // while the new data loads instead of unmounting everything.
    builder.addCase(sitesRequest.pending, (state) => ({
      ...state,
      loading: !state.list,
      refreshing: !!state.list,
      error: null,
    }));
  },
});

export const siteFiltersMiddleware = createListenerMiddleware();

// Update URL when filters are changed
siteFiltersMiddleware.startListening({
  actionCreator: sitesListSlice.actions.patchSiteFilters,
  effect: (action, listenerApi) => {
    const {
      sitesList: { filters },
    } = listenerApi.getState() as RootState;
    writeFiltersToUrl(filters);
  },
});

// Update URL when the historical date is changed
siteFiltersMiddleware.startListening({
  actionCreator: sitesListSlice.actions.setSitesListDate,
  effect: (action) => {
    writeHistoricalDateToUrl(action.payload);
  },
});

// Clear filters when the clear action is dispatched
siteFiltersMiddleware.startListening({
  actionCreator: sitesListSlice.actions.clearSiteFilters,
  effect: () => {
    writeFiltersToUrl({});
  },
});

export const sitesListSelector = (state: RootState): SitesListState['list'] =>
  state.sitesList.list;

export const sitesToDisplayListSelector = createSelector(
  sitesListSelector,
  (state: RootState) => state.sitesList.filters,
  (list, filters) =>
    list?.filter((s) =>
      [
        filterSiteByHeatStress(s, filters),
        filterSiteBySiteOptions(s, filters),
        filterSiteBySpecies(s, filters),
        filterSiteByReefComposition(s, filters),
        filterSiteByImpact(s, filters),
      ].every(Boolean),
    ),
);

export const sitesListFiltersSelector = (
  state: RootState,
): SitesListState['filters'] => state.sitesList.filters;

export const sitesListLoadingSelector = (
  state: RootState,
): SitesListState['loading'] => state.sitesList.loading;

export const sitesListDateSelector = (
  state: RootState,
): SitesListState['date'] => state.sitesList.date;

export const sitesListRefreshingSelector = (state: RootState): boolean =>
  !!state.sitesList.refreshing;

export const sitesListErrorSelector = (
  state: RootState,
): SitesListState['error'] => state.sitesList.error;

export const { clearSiteFilters, setSiteName, setSitesListDate } =
  sitesListSlice.actions;

// Re-export to keep function as generic
export const patchSiteFilters = sitesListSlice.actions.patchSiteFilters as <
  T extends keyof SiteFilters,
>(
  action: PatchSiteFiltersPayload<T>,
) => PayloadAction<PatchSiteFiltersPayload<T>>;

export default sitesListSlice.reducer;
