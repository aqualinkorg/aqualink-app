import { Site, siteOptions } from '../Sites/types';

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

export type SiteOnMap = (Site & { displayLng?: number }) | null;

export interface HomePageState {
  siteOnMap: SiteOnMap;
  searchResult?: MapboxGeolocationData;
  siteFilter: typeof siteOptions[number];
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
