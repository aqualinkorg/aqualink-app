// Geolocation data returned by the Mapbox geocoding API.
export interface MapboxGeolocationData {
  id: string;
  place_name: string;
  center: [number, number];
}

// Names of the map layer modes available on the homepage map.
export type MapLayerName = "Temp" | "Bleaching";

// A row of data shown in the homepage sites table.
export interface TableRow {
  tableData?: {
    id: number;
  };
  [key: string]: unknown;
}

// Core homepage state used throughout the application.
export interface HomePageState {
  /**
   * ISO date string (YYYY-MM-DD) for historical map view.
   * null means "today" (live data).
   */
  selectedDate: string | null;
}

// Backwards-compatible alias so that code using the newer `HomepageState`
// name still compiles without changes.
export type HomepageState = HomePageState;
