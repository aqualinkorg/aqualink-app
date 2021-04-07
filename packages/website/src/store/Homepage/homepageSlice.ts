import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { HomePageState } from "./types";
import { Reef } from "../Reefs/types";
import type { RootState } from "../configure";

const homepageInitialState: HomePageState = {
  reefOnMap: null,
  withSpotterOnly: false,
};

const homepageSlice = createSlice({
  name: "homepage",
  initialState: homepageInitialState,
  reducers: {
    setWithSpotterOnly: (state, action: PayloadAction<boolean>) => ({
      ...state,
      withSpotterOnly: action.payload,
    }),
    setSearchResult: (
      state,
      action: PayloadAction<HomePageState["searchResult"]>
    ) => ({
      ...state,
      searchResult: action.payload,
    }),
    setReefOnMap: (state, action: PayloadAction<Reef>) => ({
      ...state,
      reefOnMap: action.payload,
    }),
    unsetReefOnMap: (state) => ({
      ...state,
      reefOnMap: null,
    }),
  },
});

export const reefOnMapSelector = (
  state: RootState
): HomePageState["reefOnMap"] => state.homepage.reefOnMap;

export const searchResultSelector = (
  state: RootState
): HomePageState["searchResult"] => state.homepage.searchResult;

export const withSpotterOnlySelector = (
  state: RootState
): HomePageState["withSpotterOnly"] => state.homepage.withSpotterOnly;

export const {
  setSearchResult,
  setReefOnMap,
  unsetReefOnMap,
  setWithSpotterOnly,
} = homepageSlice.actions;

export default homepageSlice.reducer;
