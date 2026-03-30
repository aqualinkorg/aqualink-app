import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { HomePageState, MapLayerName, MapboxGeolocationData } from "./types";

const homepageInitialState: HomePageState = {
  selectedMapLayer: "Heat",
  geolocationData: null,
  searchResult: undefined,
  featuredSites: [],
  selectedDate: null,
};

const homepageSlice = createSlice({
  name: "homepage",
  initialState: homepageInitialState,
  reducers: {
    setSelectedMapLayer: (
      state,
      action: PayloadAction<MapLayerName>
    ) => {
      state.selectedMapLayer = action.payload;
    },
    setGeolocationData: (
      state,
      action: PayloadAction<MapboxGeolocationData | null>
    ) => {
      state.geolocationData = action.payload;
    },
    setSearchResult: (
      state,
      action: PayloadAction<HomePageState["searchResult"]>
    ) => {
      state.searchResult = action.payload;
    },
    setFeaturedSites: (state, action: PayloadAction<number[]>) => {
      state.featuredSites = action.payload;
    },
    setSelectedDate: (state, action: PayloadAction<string | null>) => {
      state.selectedDate = action.payload;
    },
  },
});

export const {
  setSelectedMapLayer,
  setGeolocationData,
  setSearchResult,
  setFeaturedSites,
  setSelectedDate,
} = homepageSlice.actions;

export default homepageSlice.reducer;
