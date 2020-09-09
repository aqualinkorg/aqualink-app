import { Reef } from "../Reefs/types";

export interface HomePageState {
  reefOnMap: Reef | null;
}

export interface TableRow {
  locationName: string | null;
  temp: number | null;
  depth: number | null;
  dhw: number | null;
  tableData: {
    id: number;
  };
  alert: number | null;
}
