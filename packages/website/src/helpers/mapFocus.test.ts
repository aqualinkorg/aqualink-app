import { planSiteMapFocus } from './map';

describe('planSiteMapFocus', () => {
  const viewport = { viewportWidth: 800, viewportHeight: 600 };

  it('skips animation when the target is already in view', () => {
    expect(
      planSiteMapFocus({ ...viewport, distancePx: 4, zoomDelta: 0 }),
    ).toEqual({ mode: 'none', duration: 0 });
  });

  it('pans nearby same-zoom targets instead of flyTo', () => {
    const plan = planSiteMapFocus({
      ...viewport,
      distancePx: 180,
      zoomDelta: 0,
    });
    expect(plan.mode).toBe('pan');
    expect(plan.duration).toBeGreaterThanOrEqual(1);
    expect(plan.duration).toBeLessThan(2.5);
  });

  it('flies far targets for about 2–3 seconds', () => {
    const plan = planSiteMapFocus({
      ...viewport,
      distancePx: 2000,
      zoomDelta: 0,
    });
    expect(plan.mode).toBe('fly');
    expect(plan.duration).toBeGreaterThanOrEqual(2);
    expect(plan.duration).toBeLessThanOrEqual(3.2);
  });
});
