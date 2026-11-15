import type { Map as MaplibreMap } from 'maplibre-gl';
import type { HomepageMapHandle } from './homepageMapHandle';
import { HOMEPAGE_MAP_KIND } from './homepageMapHandle';
import { planSiteMapFocus } from './map';

/** Matches Leaflet focusMapOnSite: site sits 100px below the camera center. */
const SITE_FOCUS_SHIFT_Y = -100;

/**
 * Globe `project()` still returns a screen point for locations on the back of
 * the planet, and `unproject()` of that point is a different place. Panning
 * toward it leaves the camera on the wrong side of the earth.
 */
const globeHidesSite = (
  map: MaplibreMap,
  longitude: number,
  latitude: number,
) => {
  const { transform } = map as MaplibreMap & {
    transform?: {
      isLocationOccluded?: (lngLat: { lng: number; lat: number }) => boolean;
    };
  };
  return Boolean(
    transform?.isLocationOccluded?.({ lng: longitude, lat: latitude }),
  );
};

export const focusMaplibreOnSite = (
  map: MaplibreMap,
  longitude: number,
  latitude: number,
) => {
  const zoom = map.getZoom() ?? 6;

  if (globeHidesSite(map, longitude, latitude)) {
    const container = map.getContainer();
    const plan = planSiteMapFocus({
      distancePx: Math.hypot(container.clientWidth, container.clientHeight),
      viewportWidth: container.clientWidth,
      viewportHeight: container.clientHeight,
    });
    map.flyTo({
      center: [longitude, latitude],
      zoom,
      duration: plan.duration * 1000,
      essential: true,
    });
    return;
  }

  const target = map.project([longitude, latitude]);
  const centerLngLat = map.unproject([target.x, target.y + SITE_FOCUS_SHIFT_Y]);
  const current = map.project(map.getCenter());
  const next = map.project(centerLngLat);
  const distancePx = Math.hypot(current.x - next.x, current.y - next.y);
  const container = map.getContainer();
  const plan = planSiteMapFocus({
    distancePx,
    viewportWidth: container.clientWidth,
    viewportHeight: container.clientHeight,
  });

  if (plan.mode === 'none') {
    return;
  }

  const center: [number, number] = [centerLngLat.lng, centerLngLat.lat];
  const duration = plan.duration * 1000;

  if (plan.mode === 'pan') {
    map.easeTo({ center, duration, essential: true });
    return;
  }

  map.flyTo({ center, zoom, duration, essential: true });
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
