import { latLngBounds, LatLngBounds } from "leaflet";
import { isEqual } from "lodash";

import type { Point, Polygon, Position } from "../store/Reefs/types";

export const locationCalculator = (point: Point | Polygon): Position => {
  if (point.type === "Point") {
    return point.coordinates;
  }

  const coordArray = point.coordinates[0];
  const len = coordArray.length;
  const lngArray = coordArray.map((item) => item[0]);
  const latArray = coordArray.map((item) => item[1]);

  const lngMean = lngArray.reduce((a, b) => a + b) / len;
  const latMean = latArray.reduce((a, b) => a + b) / len;

  return [lngMean, latMean];
};

export const mapBounds = (polygon: Polygon): LatLngBounds => {
  const latArr = polygon.coordinates[0].map((coord) => coord[1]);
  const lngArr = polygon.coordinates[0].map((coord) => coord[0]);

  const north = Math.max(...latArr);
  const south = Math.min(...latArr);
  const east = Math.max(...lngArr);
  const west = Math.min(...lngArr);

  return latLngBounds([south, west], [north, east]);
};

export const samePosition = (
  polygon1: Polygon | Point,
  polygon2: Polygon | Point
) => {
  const coords1 =
    polygon1.type === "Polygon"
      ? locationCalculator(polygon1)
      : polygon1.coordinates;
  const coords2 =
    polygon2.type === "Polygon"
      ? locationCalculator(polygon2)
      : polygon2.coordinates;

  return isEqual(coords1, coords2);
};
