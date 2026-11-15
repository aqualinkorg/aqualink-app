import type { Map as MaplibreMap } from 'maplibre-gl';
import type { HomepageMapHandle } from './homepageMapHandle';
import { HOMEPAGE_MAP_KIND } from './homepageMapHandle';
import { planSiteMapFocus } from './map';

/**
 * Site sits 100px below the camera center, same as Leaflet.
 * Globe `flyTo` retargets through `setLocationAtPoint`, and `unproject` of a
 * point off the disc hits the north pole. Ease to the real coordinates so a
 * far site arrives in one move.
 */
const SITE_FOCUS_SHIFT_PX = 100;
const MAX_FOCUS_LATITUDE = 85;

const shortestLngDelta = (from: number, to: number) =>
  ((to - from + 540) % 360) - 180;

const focusCenter = (longitude: number, latitude: number, zoom: number) => {
  const worldSize = 512 * 2 ** zoom;
  const shiftDeg = (SITE_FOCUS_SHIFT_PX / worldSize) * 360;
  const latitudeNorth = Math.min(
    MAX_FOCUS_LATITUDE,
    Math.max(-MAX_FOCUS_LATITUDE, latitude + shiftDeg),
  );
  return { longitude, latitude: latitudeNorth, worldSize };
};

export const focusMaplibreOnSite = (
  map: MaplibreMap,
  longitude: number,
  latitude: number,
) => {
  const zoom = map.getZoom() ?? 6;
  const center = focusCenter(longitude, latitude, zoom);
  const current = map.getCenter();
  const distancePx =
    (Math.hypot(
      shortestLngDelta(current.lng, center.longitude),
      center.latitude - current.lat,
    ) /
      360) *
    center.worldSize;
  const container = map.getContainer();
  const plan = planSiteMapFocus({
    distancePx,
    viewportWidth: container.clientWidth,
    viewportHeight: container.clientHeight,
  });

  if (plan.mode === 'none') {
    return;
  }

  map.easeTo({
    center: [center.longitude, center.latitude],
    zoom,
    duration: plan.duration * 1000,
    essential: true,
  });
};

export const createHomepageMapHandle = (
  map: MaplibreMap,
): HomepageMapHandle => ({
  kind: HOMEPAGE_MAP_KIND,
  resize: () => {
    map.resize();
  },
  getCenter: () => {
    const center = map.getCenter();
    return { lat: center.lat, lng: center.lng };
  },
  flyTo: (latitude, longitude, zoom, durationSeconds) => {
    map.flyTo({
      center: [longitude, latitude],
      zoom,
      duration: durationSeconds * 1000,
      essential: true,
    });
  },
  fitBounds: (southWest, northEast) => {
    map.fitBounds(
      [
        [southWest[1], southWest[0]],
        [northEast[1], northEast[0]],
      ],
      { padding: 40, duration: 1000 },
    );
  },
  focusOnSite: (latitude, longitude) => {
    focusMaplibreOnSite(map, longitude, latitude);
  },
});
