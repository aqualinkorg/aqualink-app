import { isEqual, mean, meanBy, minBy } from "lodash";
import L, { LatLng, LatLngBounds, Polygon as LeafletPolygon } from "leaflet";
import { makeStyles } from "@material-ui/core";

import type { Point, Pois, Polygon, Position } from "../store/Reefs/types";
import { spotter } from "../assets/spotter";
import { spotterSelected } from "../assets/spotterSelected";
import { spotterAnimation } from "../assets/spotterAnimation";
import { hobo } from "../assets/hobo";
import { hoboSelected } from "../assets/hoboSelected";
import { CollectionDetails } from "../store/User/types";

/**
 * Get the middle point of a polygon (average of all points). Returns the point itself if input isn't a polygon.
 */
export const getMiddlePoint = (point: Point | Polygon): Position => {
  if (point.type === "Point") {
    return point.coordinates;
  }

  const coordArray = point.coordinates[0];
  const lngArray = coordArray.map((item) => item[0]);
  const latArray = coordArray.map((item) => item[1]);

  const lngMean = mean(lngArray);
  const latMean = mean(latArray);

  return [lngMean, latMean];
};

export const samePosition = (
  polygon1: Polygon | Point,
  polygon2: Polygon | Point
) => {
  const coords1 =
    polygon1.type === "Polygon"
      ? getMiddlePoint(polygon1)
      : polygon1.coordinates;
  const coords2 =
    polygon2.type === "Polygon"
      ? getMiddlePoint(polygon2)
      : polygon2.coordinates;

  return isEqual(coords1, coords2);
};

export const getCollectionCenterAndBounds = (
  collection?: CollectionDetails
): [LatLng | undefined, LatLngBounds | undefined] => {
  if (!collection) {
    return [undefined, undefined];
  }

  const coordinates = collection.reefs.map((item) =>
    getMiddlePoint(item.polygon)
  );

  const center = new LatLng(
    meanBy(coordinates, (item) => item[1]),
    meanBy(coordinates, (item) => item[0])
  );

  const bounds = new LeafletPolygon(
    coordinates.map((item) => new LatLng(item[1], item[0]))
  ).getBounds();

  return [center, bounds];
};

/**
 * Returns the distance between two points in radians
 */
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
      ? getMiddlePoint(reefPolygon)
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
          getMiddlePoint(polygon)
        ),
      };
    });

  return minBy(distances, "distance")?.pointId;
};

const useMarkerStyles = makeStyles({
  spotterIconWrapper: {},
  hoboIcon: {
    height: "inherit",
    width: "inherit",
  },
  spotterIconSteady: {
    height: "inherit",
    width: "inherit",
    position: "relative",
    left: 0,
    right: 0,
    top: "-100%",
  },
  spotterIconBlinking: {
    width: "inherit",
    height: "inherit",
    animation: "$pulse 2s infinite",
  },
  "@keyframes pulse": {
    "0%": { strokeOpacity: 1 },
    "50%": { strokeOpacity: 1, transform: "scale(1)" },
    "100%": { strokeOpacity: 0, transform: "scale(3)" },
  },
});

export const buoyIcon = (iconUrl: string) =>
  new L.Icon({
    iconUrl,
    iconSize: [24, 27],
    iconAnchor: [12, 27],
    popupAnchor: [0, -28],
  });

export const useSensorIcon = (
  sensor: "spotter" | "hobo",
  selected: boolean,
  color: string
) => {
  const classes = useMarkerStyles();
  const iconWidth = sensor === "spotter" ? 20 : 25;
  const iconHeight = sensor === "spotter" ? 20 : 25;
  return L.divIcon({
    iconSize: [iconWidth, iconHeight],
    iconAnchor: [iconWidth / 2, 0],
    html:
      sensor === "spotter"
        ? `
          <div class=${classes.spotterIconBlinking}>
            ${spotterAnimation(color)}
          </div>
          <div class=${classes.spotterIconSteady}>
            ${selected ? spotterSelected(color) : spotter(color)}
          </div>
        `
        : `
          <div class=${classes.hoboIcon}>
            ${selected ? hoboSelected(color) : hobo(color)}
          </div>
        `,
    className: classes.spotterIconWrapper,
  });
};

export const useMarkerIcon = (
  hasSpotter: boolean,
  hasHobo: boolean,
  selected: boolean,
  color: string,
  iconUrl: string
) => {
  const sensorIcon = useSensorIcon(
    hasSpotter ? "spotter" : "hobo",
    selected,
    color
  );
  if (hasSpotter || hasHobo) return sensorIcon;
  return buoyIcon(iconUrl);
};
