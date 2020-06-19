import { latLngBounds, LatLngBounds } from "leaflet";

import { Reef } from "../store/Reefs/types";

export const mapBounds = (
  coordinates: Reef["polygon"]["coordinates"]
): LatLngBounds => {
  const latArr = coordinates[0].map((coord) => coord[0]);
  const lngArr = coordinates[0].map((coord) => coord[1]);

  const north = Math.max(...latArr);
  const south = Math.min(...latArr);
  const east = Math.max(...lngArr);
  const west = Math.min(...lngArr);

  return latLngBounds([south, west], [north, east]);
};
