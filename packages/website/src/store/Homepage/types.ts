import { Site } from '../Sites/types';

export interface MapboxGeolocationData {
  bbox: {
    southWest: [number, number];
    northEast: [number, number];
  };
  placeName: string;
}

export type MapLayerName =
  | 'Heat Stress'
  | 'Sea Surface Temperature'
  | 'SST Anomaly';

export interface HomePageState {
  siteOnMap: Site | null;
  searchResult?: MapboxGeolocationData;
  withSpotterOnly: boolean;
}

export interface TableRow {
  locationName: string | null;
  region?: string | null;
  sst: number | null;
  historicMax: number | null;
  sstAnomaly: number | null;
  buoyTop: number | null;
  buoyBottom: number | null;
  maxMonthlyMean: number | null;
  depth: number | null;
  dhw: number | null;
  tableData: {
    id: number;
  };
  alertLevel: number | null;
  alert: string | null;
}
