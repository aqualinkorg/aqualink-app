import { Reef } from "../Reefs/types";

export interface MapboxGeolocationData {
  bbox: {
    southWest: [number, number];
    northEast: [number, number];
  };
  placeName: string;
}

export interface HomePageState {
  reefOnMap: Reef | null;
  searchResult?: MapboxGeolocationData;
  withSpotterOnly: boolean;
  mapInitialReef: Reef | null;
}

export interface TableRow {
  locationName: string | null;
  region?: string | null;
  temp: number | null;
  maxMonthlyMean: number | null;
  depth: number | null;
  dhw: number | null;
  tableData: {
    id: number;
  };
  alertLevel: number | null;
  alert: string | null;
}
