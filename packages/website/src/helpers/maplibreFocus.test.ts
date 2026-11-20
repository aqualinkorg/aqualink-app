import type { Map as MaplibreMap } from 'maplibre-gl';
import { createHomepageMapHandle, focusMaplibreOnSite } from './maplibreFocus';

const mercatorY = (latitude: number) =>
  (180 -
    (180 / Math.PI) *
      Math.log(Math.tan(Math.PI / 4 + (latitude * Math.PI) / 360))) /
  360;

const pixelsNorth = (fromLat: number, toLat: number, zoom: number) =>
  (mercatorY(fromLat) - mercatorY(toLat)) * 512 * 2 ** zoom;

const mockMap = (center: { lng: number; lat: number }, zoom = 4) => {
  const easeTo = vi.fn();
  const flyTo = vi.fn();
  const map = {
    getZoom: () => zoom,
    getCenter: () => center,
    getContainer: () => ({ clientWidth: 800, clientHeight: 600 }),
    easeTo,
    flyTo,
  } as unknown as MaplibreMap;

  return { map, easeTo, flyTo };
};

describe('createHomepageMapHandle.fitBounds', () => {
  it('adds 360 to the east longitude when the bbox crosses the antimeridian', () => {
    const fitBounds = vi.fn();
    const map = { fitBounds } as unknown as MaplibreMap;

    createHomepageMapHandle(map).fitBounds([-20, 177], [-15, -178]);

    expect(fitBounds).toHaveBeenCalledWith(
      [
        [177, -20],
        [182, -15],
      ],
      { padding: 40, duration: 1000 },
    );
  });
});

describe('focusMaplibreOnSite', () => {
  it('eases to the site longitude, shifted 100px north, and keeps the zoom', () => {
    const { map, easeTo, flyTo } = mockMap({ lng: 10, lat: 0 });

    focusMaplibreOnSite(map, 12, 5);

    expect(flyTo).not.toHaveBeenCalled();
    expect(easeTo).toHaveBeenCalledWith(
      expect.objectContaining({
        center: [12, expect.any(Number)],
        zoom: 4,
        duration: 1000,
      }),
    );
    const targetLat = easeTo.mock.calls[0][0].center[1] as number;
    expect(pixelsNorth(5, targetLat, 4)).toBeCloseTo(100, 4);
  });

  it('takes the long duration for a site on the other side of the earth', () => {
    const { map, easeTo, flyTo } = mockMap({ lng: 0, lat: 0 });

    focusMaplibreOnSite(map, 180, 0);

    expect(flyTo).not.toHaveBeenCalled();
    expect(easeTo).toHaveBeenCalledWith(
      expect.objectContaining({
        center: [180, expect.any(Number)],
        zoom: 4,
      }),
    );
    const { duration } = easeTo.mock.calls[0][0];
    expect(duration).toBeGreaterThanOrEqual(2000);
    expect(duration).toBeLessThanOrEqual(3200);
  });

  it('keeps a 100px north offset away from the equator', () => {
    const { map, easeTo } = mockMap({ lng: 0, lat: 60 });

    focusMaplibreOnSite(map, 10, 60);

    const targetLat = easeTo.mock.calls[0][0].center[1] as number;
    expect(pixelsNorth(60, targetLat, 4)).toBeCloseTo(100, 4);
    expect(targetLat - 60).toBeLessThan((100 / (512 * 2 ** 4)) * 360);
  });

  it('does not climb past 85 degrees when the site is near the pole', () => {
    const { map, easeTo } = mockMap({ lng: 0, lat: 0 }, 2);

    focusMaplibreOnSite(map, 20, 84.9);

    expect(easeTo).toHaveBeenCalledWith(
      expect.objectContaining({
        center: [20, 85],
      }),
    );
  });

  it('does not move when the site is already in the focus position', () => {
    const first = mockMap({ lng: 10, lat: 0 });
    focusMaplibreOnSite(first.map, 10, 20);
    const [lng, lat] = first.easeTo.mock.calls[0][0].center as [number, number];
    const { map, easeTo, flyTo } = mockMap({ lng, lat });

    focusMaplibreOnSite(map, 10, 20);

    expect(easeTo).not.toHaveBeenCalled();
    expect(flyTo).not.toHaveBeenCalled();
  });
});
