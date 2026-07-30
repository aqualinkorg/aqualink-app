import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { HomePageState, SiteOnMap } from './types';
import { siteOptions } from '../Sites/types';
import type { RootState } from '../configure';

const homepageInitialState: HomePageState = {
  siteOnMap: null,
  siteFilter: 'All sites',
  selectedDate: null,
};

const homepageSlice = createSlice({
  name: 'homepage',
  initialState: homepageInitialState,
  reducers: {
    setWithSpotterOnly: (
      state,
      action: PayloadAction<(typeof siteOptions)[number]>,
    ) => ({
      ...state,
      siteFilter: action.payload,
    }),
    setSearchResult: (
      state,
      action: PayloadAction<HomePageState['searchResult']>,
    ) => ({
      ...state,
      searchResult: action.payload,
    }),
    setSiteOnMap: (state, action: PayloadAction<SiteOnMap>) => ({
      ...state,
      siteOnMap: action.payload,
    }),
    unsetSiteOnMap: (state) => ({
      ...state,
      siteOnMap: null,
    }),
    setSelectedDate: (state, action: PayloadAction<string | null>) => ({
      ...state,
      selectedDate: action.payload,
    }),
  },
});

export const isSelectedOnMapSelector = (id: number) => (state: RootState) =>
  state.homepage.siteOnMap?.id === id;

export const siteOnMapSelector = (
  state: RootState,
): HomePageState['siteOnMap'] => state.homepage.siteOnMap;

export const searchResultSelector = (
  state: RootState,
): HomePageState['searchResult'] => state.homepage.searchResult;

export const siteFilterSelector = (
  state: RootState,
): HomePageState['siteFilter'] => state.homepage.siteFilter;

export const selectedDateSelector = (
  state: RootState,
): HomePageState['selectedDate'] => state.homepage.selectedDate;

export const {
  setSearchResult,
  setSiteOnMap,
  unsetSiteOnMap,
  setWithSpotterOnly,
  setSelectedDate,
} = homepageSlice.actions;

export default homepageSlice.reducer;
