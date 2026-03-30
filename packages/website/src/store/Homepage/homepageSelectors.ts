import { RootState } from "../index";

export const homepageStateSelector = (state: RootState) => state.homepage;

export const selectedMapLayerSelector = (state: RootState) =>
  state.homepage.selectedMapLayer;

export const geolocationDataSelector = (state: RootState) =>
  state.homepage.geolocationData;

export const searchResultSelector = (state: RootState) =>
  state.homepage.searchResult;

export const featuredSitesSelector = (state: RootState) =>
  state.homepage.featuredSites;

/**
 * Returns the ISO date string (YYYY-MM-DD) the user has selected for
 * historical map view, or null when showing live data.
 */
export const selectedDateSelector = (state: RootState) =>
  state.homepage.selectedDate;
