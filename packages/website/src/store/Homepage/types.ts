import { Reef } from "../Reefs/types";

export interface HomePageState {
  reefOnMap: Reef | null;
}

export interface TableRow {
  locationName: string | null;
  temp: string | 0;
  depth: number | null;
  dhw: number | null;
  alert?: string;
  tableData: {
    id: number;
  };
}
