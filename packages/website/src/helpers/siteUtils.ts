import { LatLng } from "leaflet";
import { maxBy, meanBy } from "lodash";

import { longDHW } from "../store/Sites/helpers";
import { Site, UpdateSiteNameFromListArgs } from "../store/Sites/types";

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
