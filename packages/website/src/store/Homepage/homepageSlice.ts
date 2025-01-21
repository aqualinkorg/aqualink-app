import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { HomePageState } from './types';
import { Site, siteOptions } from '../Sites/types';
import type { RootState } from '../configure';

const homepageInitialState: HomePageState = {
  siteOnMap: null,
  siteFilter: 'All sites',
};

const homepageSlice = createSlice({
  name: 'homepage',
  initialState: homepageInitialState,
  reducers: {
    setWithSpotterOnly: (
      state,
      action: PayloadAction<typeof siteOptions[number]>,
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
    setSiteOnMap: (state, action: PayloadAction<Site>) => ({
      ...state,
      siteOnMap: action.payload,
    }),
    unsetSiteOnMap: (state) => ({
      ...state,
      siteOnMap: null,
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

export const {
  setSearchResult,
  setSiteOnMap,
  unsetSiteOnMap,
  setWithSpotterOnly,
} = homepageSlice.actions;

export default homepageSlice.reducer;
