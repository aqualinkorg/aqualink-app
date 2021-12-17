import { LatLng } from "leaflet";
import { maxBy, meanBy, omitBy, isUndefined } from "lodash";

import { Site, UpdateSiteNameFromListArgs } from "../store/Sites/types";
import type { TimeSeriesDataRequestParams } from "../store/Sites/types";

export const longDHW = (dhw: number | null): string =>
  `0000${dhw ? Math.round(dhw * 10) : "0"}`.slice(-4);

export const findSiteById = (sites: Site[], siteId: string): Site | null => {
  return (
    sites.find((site: Site) => {
      return site.id.toString() === siteId;
    }) || null
  );
};

/**
 * If an initial site is provided we try to load it, otherwise we find the site with the highest
 * alert level.
 * @param sites
 * @param initialSiteId
 * @returns LatLng of the initial Site
 */
export const findInitialSitePosition = (
  sites: Site[],
  initialSiteId?: string
): LatLng | null => {
  const initialSite =
    (initialSiteId && findSiteById(sites, initialSiteId)) ||
    maxBy(
      sites,
      (site) =>
        `${site.collectionData?.weeklyAlert || 0},${longDHW(
          site.collectionData?.dhw || null
        )}`
    );

  // If the polygon type is a Point, return its coordinates
  if (initialSite?.polygon.type === "Point") {
    return new LatLng(
      initialSite.polygon.coordinates[1],
      initialSite.polygon.coordinates[0]
    );
  }

  // If the polygon type is a Polygon, return the coordinates of its centroid
  if (initialSite?.polygon.type === "Polygon") {
    const centroidLat = meanBy(
      initialSite.polygon.coordinates[0],
      (coords) => coords[1]
    );
    const centroidLng = meanBy(
      initialSite.polygon.coordinates[0],
      (coords) => coords[0]
    );

    return new LatLng(centroidLat, centroidLng);
  }

  return null;
};

// Util function that checks if a site has a deployed spotter
export const hasDeployedSpotter = (site?: Site | null) =>
  Boolean(site?.sensorId && site?.status === "deployed");

export const belongsToCollection = (siteId: number, siteIds?: number[]) =>
  siteIds?.includes(siteId);

export const setSiteNameFromList = ({
  id,
  list,
  name,
}: UpdateSiteNameFromListArgs): Site[] | undefined =>
  list?.map((item) => (item.id === id && name ? { ...item, name } : item));

export const constructTimeSeriesDataRequestUrl = ({
  siteId,
  pointId,
  ...rest
}: TimeSeriesDataRequestParams) => {
  const params = new URLSearchParams({
    ...omitBy(rest, isUndefined),
  }).toString();

  return `time-series/sites/${siteId}${
    pointId ? `/site-survey-points/${pointId}` : ""
  }${params.length ? `?${params}` : ""}`;
};
