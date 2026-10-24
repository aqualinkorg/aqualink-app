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
  SitesRequestArgs,
  SitesRequestData,
  UpdateSiteNameFromListArgs,
} from './types';
import type { CreateAsyncThunkTypes, RootState } from '../configure';
import { readFiltersFromUrl, writeFiltersToUrl } from './helpers';

const sitesListInitialState: SitesListState = {
  loading: false,
  error: null,
  filters: {},
};

const requestedDate = (arg?: SitesRequestArgs) => arg?.date ?? null;

/**
 * Fetches the sites list.
 * - Without arguments, it only makes sure a list is loaded (any date).
 * - With `{ date }`, it makes sure the list holds the data of that date
 *   (`null` for the latest data), refetching if needed. When several dates
 *   are requested in a row, only the last request's response is kept.
 */
export const sitesRequest = createAsyncThunk<
  SitesRequestData,
  SitesRequestArgs | undefined,
  CreateAsyncThunkTypes
>(
  'sitesList/request',
  async (arg, { rejectWithValue }) => {
    try {
      const { data } = await siteServices.getSites(requestedDate(arg));
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
    condition(arg, { getState }) {
      const {
        sitesList: { list, loading, date = null, pendingDate = null },
      } = getState();
      if (!arg) {
        return !list && !loading;
      }
      const wantedDate = requestedDate(arg);
      if (loading) {
        return pendingDate !== wantedDate;
      }
      return !list || date !== wantedDate;
    },
  },
);

const sitesListSlice = createSlice({
  name: 'sitesList',
  initialState: () => ({
    ...sitesListInitialState,
    filters: readFiltersFromUrl(),
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
    setSiteName: (
      state,
      action: PayloadAction<UpdateSiteNameFromListArgs>,
    ) => ({
      ...state,
      list: setSiteNameFromList(action.payload),
    }),
  },
  extraReducers: (builder) => {
    builder.addCase(sitesRequest.fulfilled, (state, action) =>
      // Ignore responses of outdated requests (e.g. a previous date)
      action.meta.requestId !== state.currentRequestId
        ? state
        : {
            ...state,
            list: action.payload.list,
            date: requestedDate(action.meta.arg),
            pendingDate: undefined,
            currentRequestId: undefined,
            loading: false,
          },
    );

    builder.addCase(sitesRequest.rejected, (state, action) =>
      action.meta.requestId !== state.currentRequestId
        ? state
        : {
            ...state,
            error: action.error.message
              ? action.error.message
              : action.error.toString(),
            pendingDate: undefined,
            currentRequestId: undefined,
            loading: false,
          },
    );

    builder.addCase(sitesRequest.pending, (state, action) => ({
      ...state,
      loading: true,
      error: null,
      pendingDate: requestedDate(action.meta.arg),
      currentRequestId: action.meta.requestId,
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

/** Historical date of the displayed sites data, `null` for the latest. */
export const sitesListDateSelector = (state: RootState): string | null =>
  state.sitesList?.date ?? null;

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
