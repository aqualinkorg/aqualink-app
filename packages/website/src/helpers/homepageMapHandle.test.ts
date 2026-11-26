import type { Map as LeafletMap } from 'leaflet';
import {
  HOMEPAGE_MAP_KIND,
  longitudeForSiteSelection,
  type HomepageMapHandle,
} from './homepageMapHandle';

describe('longitudeForSiteSelection', () => {
  it('returns the site longitude when no map is available', () => {
    expect(longitudeForSiteSelection(null, -170)).toBe(-170);
  });

  it('keeps the real longitude on the homepage globe', () => {
    const handle = { kind: HOMEPAGE_MAP_KIND } as HomepageMapHandle;
    expect(longitudeForSiteSelection(handle, -170)).toBe(-170);
  });

  it('still wraps longitude for a Leaflet map', () => {
    const leafletMap = {
      getCenter: () => ({ lng: 170, lat: 0 }),
    } as unknown as LeafletMap;

    expect(longitudeForSiteSelection(leafletMap, -170)).toBe(190);
  });
});
