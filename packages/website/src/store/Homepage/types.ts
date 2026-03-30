import { LatLng } from "leaflet";

export type MapboxGeolocationData = {
  bbox: [number, number, number, number];
  center: [number, number];
  place_name: string;
};

export type MapLayerName = "Heat" | "Bleaching";

export interface TableRow {
  locationId: number;
  locationName: string;
  region: string | undefined;
  lat: number;
  lng: number;
  maxMonthlyMean: number | null;
  depth: number | null;
  metric: number | null;
  alert: string | null;
  tempWeeklyAlert: number | null;
  sstAnomaly: number | null;
  buoyTop: number | null;
  buoyBottom: number | null;
}

export interface HomePageState {
  selectedMapLayer: MapLayerName;
  geolocationData: MapboxGeolocationData | null;
  searchResult:
    | {
        bbox: [number, number, number, number];
        latitude: number;
        longitude: number;
        name: string;
      }
    | undefined;
  featuredSites: number[];
  /**
   * ISO date string (YYYY-MM-DD) for historical map view.
   * null means "today" (live data).
   */
  selectedDate: string | null;
}

// Backwards-compatible alias so newer code can reference `HomepageState`.
export type HomepageState = HomePageState;
