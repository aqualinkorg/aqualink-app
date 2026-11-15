import type { Map as MaplibreMap } from 'maplibre-gl';
import { focusMaplibreOnSite } from './maplibreFocus';

const shiftDegrees = (zoom: number) => (100 / (512 * 2 ** zoom)) * 360;

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

describe('focusMaplibreOnSite', () => {
  it('eases to the site longitude, shifted north, and keeps the zoom', () => {
    const { map, easeTo, flyTo } = mockMap({ lng: 10, lat: 0 });

    focusMaplibreOnSite(map, 12, 5);

    expect(flyTo).not.toHaveBeenCalled();
    expect(easeTo).toHaveBeenCalledWith(
      expect.objectContaining({
        center: [12, 5 + shiftDegrees(4)],
        zoom: 4,
        duration: 1000,
      }),
    );
  });

  it('takes the long duration for a site on the other side of the earth', () => {
    const { map, easeTo, flyTo } = mockMap({ lng: 0, lat: 0 });

    focusMaplibreOnSite(map, 180, 0);

    expect(flyTo).not.toHaveBeenCalled();
    expect(easeTo).toHaveBeenCalledWith(
      expect.objectContaining({
        center: [180, shiftDegrees(4)],
        zoom: 4,
      }),
    );
    const { duration } = easeTo.mock.calls[0][0];
    expect(duration).toBeGreaterThanOrEqual(2000);
    expect(duration).toBeLessThanOrEqual(3200);
  });

  it('does not climb past 85 degrees when the site is near the pole', () => {
    const { map, easeTo } = mockMap({ lng: 0, lat: 0 });

    focusMaplibreOnSite(map, 20, 84);

    expect(easeTo).toHaveBeenCalledWith(
      expect.objectContaining({
        center: [20, 85],
      }),
    );
  });

  it('does not move when the site is already in the focus position', () => {
    const zoom = 4;
    const { map, easeTo, flyTo } = mockMap(
      { lng: 10, lat: 20 + shiftDegrees(zoom) },
      zoom,
    );

    focusMaplibreOnSite(map, 10, 20);

    expect(easeTo).not.toHaveBeenCalled();
    expect(flyTo).not.toHaveBeenCalled();
  });
});
