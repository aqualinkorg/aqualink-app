import { LatLng } from "leaflet";
import { maxBy, meanBy } from "lodash";

import { longDHW } from "../store/Reefs/helpers";
import { Reef } from "../store/Reefs/types";
import { degreeHeatingWeeksCalculator } from "./degreeHeatingWeeks";

export const findReefById = (reefs: Reef[], reefId: string): Reef | null => {
  return (
    reefs.find((reef: Reef) => {
      return reef.id.toString() === reefId;
    }) || null
  );
};

/**
 * If an initial reef is provided we try to load it, otherwise we find the reef with the highest
 * alert level.
 * @param reefs
 * @param initialReefId
 * @returns LatLng of the initial Reef
 */
export const findInitialReefPosition = (
  reefs: Reef[],
  initialReefId?: string
): LatLng | null => {
  const initialReef =
    (initialReefId && findReefById(reefs, initialReefId)) ||
    maxBy(
      reefs,
      (reef) =>
        `${reef.latestDailyData?.weeklyAlertLevel || 0},${longDHW(
          degreeHeatingWeeksCalculator(reef.latestDailyData?.degreeHeatingDays)
        )}`
    );

  // If the polygon type is a Point, return its coordinates
  if (initialReef?.polygon.type === "Point") {
    return new LatLng(
      initialReef.polygon.coordinates[1],
      initialReef.polygon.coordinates[0]
    );
  }

  // If the polygon type is a Polygon, return the coordinates of its centroid
  if (initialReef?.polygon.type === "Polygon") {
    const centroidLat = meanBy(
      initialReef.polygon.coordinates[0],
      (coords) => coords[1]
    );
    const centroidLng = meanBy(
      initialReef.polygon.coordinates[0],
      (coords) => coords[0]
    );

    return new LatLng(centroidLat, centroidLng);
  }

  return null;
};

// Util function that checks if a reef has a deployed spotter
export const hasDeployedSpotter = (reef?: Reef | null) =>
  Boolean(reef?.spotterId && reef?.status === "deployed");
