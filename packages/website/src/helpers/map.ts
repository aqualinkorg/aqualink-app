import { minBy, isEqual } from "lodash";
import type { Point, Pois, Polygon, Position } from "../store/Reefs/types";

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

// Returns the distance between two points in radians
export const radDistanceCalculator = (point1: Position, point2: Position) => {
  const [lng1, lat1] = point1;
  const [lng2, lat2] = point2;

  if (lat1 === lat2 && lng1 === lng2) {
    return 0;
  }

  const radLat1 = (Math.PI * lat1) / 180;
  const radlat2 = (Math.PI * lat2) / 180;
  const theta = lng1 - lng2;
  const radtheta = (Math.PI * theta) / 180;

  const dist =
    Math.sin(radLat1) * Math.sin(radlat2) +
    Math.cos(radLat1) * Math.cos(radlat2) * Math.cos(radtheta);

  return Math.acos(dist > 1 ? 1 : dist);
};

export const findClosestSurveyPoint = (
  reefPolygon?: Polygon | Point,
  points?: Pois[]
) => {
  if (!reefPolygon || !points) {
    return undefined;
  }

  const [reefLng, reefLat] =
    reefPolygon.type === "Polygon"
      ? locationCalculator(reefPolygon)
      : reefPolygon.coordinates;
  const distances = points
    .filter((item) => item.polygon)
    .map((point) => {
      const polygon = point.polygon as Polygon | Point;
      if (polygon.type === "Point") {
        return {
          pointId: point.id,
          distance: radDistanceCalculator(
            [reefLng, reefLat],
            polygon.coordinates
          ),
        };
      }

      return {
        pointId: point.id,
        distance: radDistanceCalculator(
          [reefLng, reefLat],
          locationCalculator(polygon)
        ),
      };
    });

  return minBy(distances, "distance")?.pointId;
};
