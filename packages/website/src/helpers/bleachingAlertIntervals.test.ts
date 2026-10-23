import {
  findIntervalByLevel,
  alertColorFinder,
  alertIconFinder,
} from './bleachingAlertIntervals';

describe('bleaching observation availability', () => {
  it.each([undefined, null])(
    'does not report missing value %s as no alert',
    (value) => {
      const interval = findIntervalByLevel(value, true);
      expect(interval.label).toBe('no data');
      expect(interval.level).toBeNull();
      expect(alertColorFinder(value, true)).not.toBe(alertColorFinder(0));
      expect(alertIconFinder(value, true)).not.toBe(alertIconFinder(0));
    },
  );

  it('preserves the live fallback', () => {
    expect(findIntervalByLevel(undefined)).toEqual(findIntervalByLevel(0));
    expect(findIntervalByLevel(null)).toEqual(findIntervalByLevel(0));
  });

  it.each([
    [0, 'no alert', '#C6E5FA'],
    [1, 'watch', '#FFF200'],
    [2, 'warning', '#F8AB00'],
    [3, 'level 1', '#EF0000'],
    [4, 'level 2', '#940000'],
  ])('preserves measured level %s', (level, label, color) => {
    expect(findIntervalByLevel(level as number)).toMatchObject({
      level,
      label,
      color,
    });
  });
});
