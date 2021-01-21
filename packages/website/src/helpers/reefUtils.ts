import { LatLng } from "leaflet";
import { Reef } from "../store/Reefs/types";

export const findMaxDhwReefPosition = (reefs: Reef[]): LatLng | null => {
  const dhws = reefs.map((reef) => reef.latestDailyData.degreeHeatingDays);
  const maxDhwReef = reefs[dhws.indexOf(Math.max(...dhws))];

  // If the polygon type is a Point, return its coordinates
  if (maxDhwReef?.polygon.type === "Point") {
    return new LatLng(
      maxDhwReef.polygon.coordinates[1],
      maxDhwReef.polygon.coordinates[0]
    );
  }

  // If the polygon type is a Polygon, return the coordinates of its centroid
  if (maxDhwReef?.polygon.type === "Polygon") {
    const points = maxDhwReef.polygon.coordinates[0].length;
    const centroidLat =
      maxDhwReef.polygon.coordinates[0].reduce(
        (acum, curr) => acum + curr[1],
        0
      ) / points;
    const centroidLng =
      maxDhwReef.polygon.coordinates[0].reduce(
        (acum, curr) => acum + curr[0],
        0
      ) / points;

    return new LatLng(centroidLat, centroidLng);
  }

  return null;
};
