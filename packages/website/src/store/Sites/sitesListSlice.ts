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
import { readFiltersFromUrl, writeFiltersToUrl } from './helpers';
import {
  readHistoricalDateFromUrl,
  writeHistoricalDateToUrl,
} from './historicalDateHelpers';

type OptionalHistoricalDate = SitesListState['selectedDate'];

const sitesListInitialState: SitesListState = {
  loading: false,
  error: null,
  filters: {},
  selectedDate: null,
  loadedDate: null,
};

const resolveRequestedDate = (
  arg: OptionalHistoricalDate,
  selectedDate: OptionalHistoricalDate,
): string | null => (arg !== undefined ? arg : selectedDate) || null;

export const sitesRequest = createAsyncThunk<
  SitesRequestData,
  OptionalHistoricalDate,
  CreateAsyncThunkTypes
>(
  'sitesList/request',
  async (arg, { getState, rejectWithValue }) => {
    try {
      const targetDate = resolveRequestedDate(
        arg,
        getState().sitesList.selectedDate,
      );
      const { data } = await siteServices.getSites(targetDate || undefined);
      const sortedData = sortBy(data, 'name');
      const transformedData = sortedData.map((item) => ({
        ...item,
        collectionData: item.collectionData || {},
      }));
      return {
        list: transformedData,
        loadedDate: targetDate,
      };
    } catch (err) {
      return rejectWithValue(getAxiosErrorMessage(err));
    }
  },
  {
    condition(arg: OptionalHistoricalDate, { getState }) {
      const {
        sitesList: { list, loadedDate, selectedDate },
      } = getState();
      const targetDate = resolveRequestedDate(arg, selectedDate);
      return !list || (loadedDate || null) !== targetDate;
    },
  },
);

const sitesListSlice = createSlice({
  name: 'sitesList',
  initialState: () => ({
    ...sitesListInitialState,
    filters: readFiltersFromUrl(),
    selectedDate: readHistoricalDateFromUrl(),
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
    clearSiteFilters: (state: SitesListState) => ({
      ...state,
      filters: {},
    }),
    setSelectedDate: (
      state: SitesListState,
      action: PayloadAction<OptionalHistoricalDate>,
    ) => ({
      ...state,
      selectedDate: action.payload || null,
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
      (state, action: PayloadAction<SitesRequestData>) => ({
        ...state,
        list: action.payload.list,
        loadedDate: action.payload.loadedDate ?? null,
        loading: false,
      }),
    );

    builder.addCase(sitesRequest.rejected, (state, action) => ({
      ...state,
      error: action.error.message
        ? action.error.message
        : action.error.toString(),
      loading: false,
    }));

    builder.addCase(sitesRequest.pending, (state) => ({
      ...state,
      loading: true,
      error: null,
    }));
  },
});

export const siteFiltersMiddleware = createListenerMiddleware();

// Update URL when filters are changed while preserving any active historical date
siteFiltersMiddleware.startListening({
  actionCreator: sitesListSlice.actions.patchSiteFilters,
  effect: (action, listenerApi) => {
    const {
      sitesList: { filters, selectedDate },
    } = listenerApi.getState() as RootState;
    writeFiltersToUrl(filters);
    writeHistoricalDateToUrl(selectedDate);
  },
});

// Clear filters when the clear action is dispatched while preserving any active historical date
siteFiltersMiddleware.startListening({
  actionCreator: sitesListSlice.actions.clearSiteFilters,
  effect: (action, listenerApi) => {
    const {
      sitesList: { selectedDate },
    } = listenerApi.getState() as RootState;
    writeFiltersToUrl({});
    writeHistoricalDateToUrl(selectedDate);
  },
});

// Synchronize historical date selection with the URL query string
siteFiltersMiddleware.startListening({
  actionCreator: sitesListSlice.actions.setSelectedDate,
  effect: (action) => {
    writeHistoricalDateToUrl(action.payload);
  },
});

export const sitesListSelector = (state: RootState): SitesListState['list'] =>
  state.sitesList.list;

export const selectedDateSelector = (
  state: RootState,
): SitesListState['selectedDate'] => state.sitesList.selectedDate ?? null;

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

export const sitesListErrorSelector = (
  state: RootState,
): SitesListState['error'] => state.sitesList.error;

export const { clearSiteFilters, setSelectedDate, setSiteName } =
  sitesListSlice.actions;

// Re-export to keep function as generic
export const patchSiteFilters = sitesListSlice.actions.patchSiteFilters as <
  T extends keyof SiteFilters,
>(
  action: PatchSiteFiltersPayload<T>,
) => PayloadAction<PatchSiteFiltersPayload<T>>;

export default sitesListSlice.reducer;
