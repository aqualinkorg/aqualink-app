import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { HomePageState } from "./types";
import { Reef } from "../Reefs/types";
import type { RootState } from "../configure";

const homepageInitialState: HomePageState = {
  reefOnMap: null,
};

const homepageSlice = createSlice({
  name: "homepage",
  initialState: homepageInitialState,
  reducers: {
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
    unsetReefOnMap: () => ({
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

export const {
  setSearchResult,
  setReefOnMap,
  unsetReefOnMap,
} = homepageSlice.actions;

export default homepageSlice.reducer;
