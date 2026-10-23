import { mockSite } from 'mocks/mockSite';
import { filterSiteByHeatStress } from './siteUtils';

describe('heat stress filters and unavailable observations', () => {
  it.each([
    undefined,
    {},
    { satelliteTemperature: 26 },
    { tempWeeklyAlert: null as unknown as number },
  ])(
    'does not include missing/expired alerts in the no-alert filter (%s)',
    (collectionData) => {
      const site = { ...mockSite, collectionData };
      expect(filterSiteByHeatStress(site, { heatStress: { 0: true } })).toBe(
        true,
      );
      expect(
        filterSiteByHeatStress(site, { heatStress: { 0: true } }, true),
      ).toBeFalsy();
      expect(filterSiteByHeatStress(site, {}, true)).toBe(true);
    },
  );
  it.each([0, 1, 2, 3, 4] as const)('retains measured level %s', (level) => {
    const site = { ...mockSite, collectionData: { tempWeeklyAlert: level } };
    expect(
      filterSiteByHeatStress(site, { heatStress: { [level]: true } }, true),
    ).toBe(true);
  });
});
