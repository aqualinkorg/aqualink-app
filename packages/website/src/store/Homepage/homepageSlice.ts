import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { HomePageState } from './types';
import { Site } from '../Sites/types';
import type { RootState } from '../configure';

const homepageInitialState: HomePageState = {
  siteOnMap: null,
  withSpotterOnly: false,
};

const homepageSlice = createSlice({
  name: 'homepage',
  initialState: homepageInitialState,
  reducers: {
    setWithSpotterOnly: (state, action: PayloadAction<boolean>) => ({
      ...state,
      withSpotterOnly: action.payload,
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

export const siteOnMapSelector = (
  state: RootState,
): HomePageState['siteOnMap'] => state.homepage.siteOnMap;

export const searchResultSelector = (
  state: RootState,
): HomePageState['searchResult'] => state.homepage.searchResult;

export const withSpotterOnlySelector = (
  state: RootState,
): HomePageState['withSpotterOnly'] => state.homepage.withSpotterOnly;

export const {
  setSearchResult,
  setSiteOnMap,
  unsetSiteOnMap,
  setWithSpotterOnly,
} = homepageSlice.actions;

export default homepageSlice.reducer;
