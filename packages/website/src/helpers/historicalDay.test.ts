import { DateTime } from 'luxon-extensions';
import {
  chartWindowForDay,
  formatDay,
  isPastOrTodayDay,
  siteLinkForDay,
} from './historicalDay';

describe('historicalDay helpers', () => {
  it('accepts past days and today, rejects malformed or future days', () => {
    expect(isPastOrTodayDay('2024-03-15')).toBe(true);
    expect(isPastOrTodayDay(DateTime.utc().toFormat('yyyy-MM-dd'))).toBe(true);
    expect(
      isPastOrTodayDay(DateTime.utc().plus({ days: 2 }).toFormat('yyyy-MM-dd')),
    ).toBe(false);
    expect(isPastOrTodayDay('2024-02-30')).toBe(false);
    expect(isPastOrTodayDay('15/03/2024')).toBe(false);
    expect(isPastOrTodayDay('2024-03-15T00:00:00Z')).toBe(false);
  });

  it('links to the site page for the selected day', () => {
    expect(siteLinkForDay(42)).toBe('/sites/42');
    expect(siteLinkForDay(42, null)).toBe('/sites/42');
    expect(siteLinkForDay(42, '2024-03-15')).toBe('/sites/42?date=2024-03-15');
  });

  it('opens the charts on the month leading up to the selected day', () => {
    expect(chartWindowForDay('2024-03-15')).toEqual({
      start: '2024-02-15',
      end: '2024-03-15',
    });
  });

  it('formats a day for display', () => {
    expect(formatDay('2024-03-05')).toBe('Mar 5, 2024');
  });
});
