import { latLngBounds, LatLngBounds } from "leaflet";

import { Polygon } from "../store/Reefs/types";

export const mapBounds = (polygon: Polygon): LatLngBounds => {
  const latArr = polygon.coordinates[0].map((coord) => coord[1]);
  const lngArr = polygon.coordinates[0].map((coord) => coord[0]);

  const north = Math.max(...latArr);
  const south = Math.min(...latArr);
  const east = Math.max(...lngArr);
  const west = Math.min(...lngArr);

  return latLngBounds([south, west], [north, east]);
};

export const getTileURL = (): string => {
  const accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;
  return accessToken
    ? `https://api.mapbox.com/styles/v1/eric-ovio/ckesyzu658klw19s6zc0adlgp/tiles/{z}/{x}/{y}@2x?access_token=${accessToken}`
    : "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
};
