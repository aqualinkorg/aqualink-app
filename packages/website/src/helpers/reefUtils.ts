import { LatLng } from "leaflet";
import { maxBy, meanBy } from "lodash";

import { Reef } from "../store/Reefs/types";

export const findMaxDhwReefPosition = (reefs: Reef[]): LatLng | null => {
  const maxDhwReef = maxBy(
    reefs,
    (reef) => reef.latestDailyData.degreeHeatingDays
  );

  // If the polygon type is a Point, return its coordinates
  if (maxDhwReef?.polygon.type === "Point") {
    return new LatLng(
      maxDhwReef.polygon.coordinates[1],
      maxDhwReef.polygon.coordinates[0]
    );
  }

  // If the polygon type is a Polygon, return the coordinates of its centroid
  if (maxDhwReef?.polygon.type === "Polygon") {
    const centroidLat = meanBy(
      maxDhwReef.polygon.coordinates[0],
      (coords) => coords[1]
    );
    const centroidLng = meanBy(
      maxDhwReef.polygon.coordinates[0],
      (coords) => coords[0]
    );

    return new LatLng(centroidLat, centroidLng);
  }

  return null;
};
