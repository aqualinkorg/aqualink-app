import type { Map as MaplibreMap } from 'maplibre-gl';
import type { HomepageMapHandle } from './homepageMapHandle';
import { HOMEPAGE_MAP_KIND } from './homepageMapHandle';
import { planSiteMapFocus } from './map';

/**
 * Site sits 100px below the camera center, same as Leaflet.
 * Mercator scale at the center grows by 1/cos(lat), so the offset is in
 * projected pixels, not a fixed degree shift (100px only at the equator).
 * Globe `flyTo` retargets through `setLocationAtPoint`, and `unproject` of a
 * point off the disc hits the north pole. Ease to the real coordinates so a
 * far site arrives in one move.
 */
const SITE_FOCUS_SHIFT_PX = 100;
const MAX_FOCUS_LATITUDE = 85;
const MERCATOR_MAX_LATITUDE = 85.0511287798;

const shortestLngDelta = (from: number, to: number) =>
  ((to - from + 540) % 360) - 180;

const clampLatitude = (latitude: number) =>
  Math.min(MERCATOR_MAX_LATITUDE, Math.max(-MERCATOR_MAX_LATITUDE, latitude));

/** Mercator y in [0, 1]. Matches MapLibre `mercatorYfromLat`. */
const mercatorY = (latitude: number) => {
  const lat = clampLatitude(latitude);
  return (
    (180 -
      (180 / Math.PI) *
        Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360))) /
    360
  );
};

const latitudeFromMercatorY = (y: number) => {
  const y2 = 180 - y * 360;
  return (360 / Math.PI) * Math.atan(Math.exp((y2 * Math.PI) / 180)) - 90;
};

const focusCenter = (longitude: number, latitude: number, zoom: number) => {
  const worldSize = 512 * 2 ** zoom;
  const shiftedY = mercatorY(latitude) - SITE_FOCUS_SHIFT_PX / worldSize;
  const latitudeNorth = Math.min(
    MAX_FOCUS_LATITUDE,
    Math.max(-MAX_FOCUS_LATITUDE, latitudeFromMercatorY(shiftedY)),
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
  const distancePx = Math.hypot(
    (shortestLngDelta(current.lng, center.longitude) / 360) * center.worldSize,
    (mercatorY(center.latitude) - mercatorY(current.lat)) * center.worldSize,
  );
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
