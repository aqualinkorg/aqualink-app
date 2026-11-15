import type { Map as MaplibreMap } from 'maplibre-gl';
import { focusMaplibreOnSite } from './maplibreFocus';

const mockMap = ({
  center,
  project,
  unproject,
  transform,
}: {
  center: { lng: number; lat: number };
  project: (lngLat: { lng: number; lat: number } | [number, number]) => {
    x: number;
    y: number;
  };
  unproject: (point: [number, number]) => { lng: number; lat: number };
  transform?: {
    isLocationOccluded: (lngLat: { lng: number; lat: number }) => boolean;
  };
}) => {
  const easeTo = vi.fn();
  const flyTo = vi.fn();
  const map = {
    getZoom: () => 4,
    getCenter: () => center,
    project,
    unproject,
    getContainer: () => ({ clientWidth: 800, clientHeight: 600 }),
    easeTo,
    flyTo,
    transform,
  } as unknown as MaplibreMap;

  return { map, easeTo, flyTo };
};

describe('focusMaplibreOnSite', () => {
  it('pans a nearby site and keeps the same zoom', () => {
    const { map, easeTo, flyTo } = mockMap({
      center: { lng: 0, lat: 0 },
      project: (lngLat) => {
        const [lng, lat] = Array.isArray(lngLat)
          ? lngLat
          : [lngLat.lng, lngLat.lat];
        return { x: lng, y: lat };
      },
      unproject: ([x, y]) => ({ lng: x, lat: y }),
    });

    focusMaplibreOnSite(map, 180, 0);

    expect(flyTo).not.toHaveBeenCalled();
    expect(easeTo).toHaveBeenCalledWith(
      expect.objectContaining({
        center: [180, -100],
        duration: 1000,
      }),
    );
  });

  it('flies a far site for about 2–3 seconds', () => {
    const { map, easeTo, flyTo } = mockMap({
      center: { lng: 0, lat: 0 },
      project: (lngLat) => {
        const [lng, lat] = Array.isArray(lngLat)
          ? lngLat
          : [lngLat.lng, lngLat.lat];
        return { x: lng * 20, y: lat * 20 };
      },
      unproject: ([x, y]) => ({ lng: x, lat: y }),
    });

    focusMaplibreOnSite(map, 200, 0);

    expect(easeTo).not.toHaveBeenCalled();
    expect(flyTo).toHaveBeenCalledWith(
      expect.objectContaining({
        zoom: 4,
        center: [4000, -100],
      }),
    );
    const { duration } = flyTo.mock.calls[0][0];
    expect(duration).toBeGreaterThanOrEqual(2000);
    expect(duration).toBeLessThanOrEqual(3200);
  });

  it('flies to the real coordinates when globe projection hides the site', () => {
    const { map, easeTo, flyTo } = mockMap({
      center: { lng: 122, lat: 13 },
      project: () => ({ x: 290, y: 33 }),
      unproject: () => ({ lng: 125, lat: 26 }),
      transform: { isLocationOccluded: () => true },
    });

    focusMaplibreOnSite(map, -64.77, 32.27);

    expect(easeTo).not.toHaveBeenCalled();
    expect(flyTo).toHaveBeenCalledWith(
      expect.objectContaining({
        center: [-64.77, 32.27],
        zoom: 4,
      }),
    );
    const { duration } = flyTo.mock.calls[0][0];
    expect(duration).toBeGreaterThanOrEqual(2000);
    expect(duration).toBeLessThanOrEqual(3200);
  });

  it('does not move when the site is already centered', () => {
    const { map, easeTo, flyTo } = mockMap({
      center: { lng: 10, lat: 20 },
      project: () => ({ x: 0, y: 100 }),
      unproject: () => ({ lng: 10, lat: 20 }),
    });

    focusMaplibreOnSite(map, 10, 20);

    expect(easeTo).not.toHaveBeenCalled();
    expect(flyTo).not.toHaveBeenCalled();
  });
});
