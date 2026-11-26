import type { Map as LeafletMap } from 'leaflet';
import { calculateAdjustedLng } from './map';

export const HOMEPAGE_MAP_KIND = 'maplibre' as const;

/**
 * Camera handle for the homepage globe. Site table row clicks use this
 * instead of a Leaflet map. Longitude is not wrapped onto ±360 copies.
 */
export type HomepageMapHandle = {
  kind: typeof HOMEPAGE_MAP_KIND;
  resize: () => void;
  getCenter: () => { lat: number; lng: number };
  flyTo: (
    latitude: number,
    longitude: number,
    zoom: number,
    durationSeconds: number,
  ) => void;
  fitBounds: (southWest: [number, number], northEast: [number, number]) => void;
  focusOnSite: (latitude: number, longitude: number) => void;
};

export const isHomepageMapHandle = (
  map: LeafletMap | HomepageMapHandle | null | undefined,
): map is HomepageMapHandle =>
  Boolean(
    map &&
    typeof map === 'object' &&
    'kind' in map &&
    map.kind === HOMEPAGE_MAP_KIND,
  );

/** Globe has one Earth, so homepage selection keeps the site longitude. */
export const longitudeForSiteSelection = (
  map: LeafletMap | HomepageMapHandle | null | undefined,
  longitude: number,
): number => {
  if (!map || isHomepageMapHandle(map)) {
    return longitude;
  }
  return calculateAdjustedLng(map, longitude);
};
