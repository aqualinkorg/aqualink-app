import { DateTime } from 'luxon-extensions';
import {
  formatHistoricalDate,
  getHistoricalDailyDataRange,
  getSiteUrl,
  isValidHistoricalDate,
  todayISODate,
} from './historicalDate';

describe('historicalDate helpers', () => {
  const yesterday = DateTime.utc().minus({ days: 1 }).toISODate() as string;

  it.each([
    ['2024-03-15', true],
    ['1985-01-01', true],
    ['1984-12-31', false],
    ['2024-02-30', false],
    ['2024-13-01', false],
    ['2024-3-15', false],
    ['2024-03-15T00:00:00Z', false],
    ['yesterday', false],
    ['', false],
    [null, false],
    [undefined, false],
  ])('isValidHistoricalDate(%s) is %s', (value, expected) => {
    expect(isValidHistoricalDate(value)).toBe(expected);
  });

  it('accepts yesterday but not today or the future', () => {
    expect(isValidHistoricalDate(yesterday)).toBe(true);
    expect(isValidHistoricalDate(todayISODate())).toBe(false);
    expect(
      isValidHistoricalDate(
        DateTime.utc().plus({ days: 3 }).toISODate() as string,
      ),
    ).toBe(false);
  });

  it('builds a daily data range ending at the end of the date (UTC)', () => {
    const { start, end } = getHistoricalDailyDataRange('2024-03-15');
    expect(end).toBe('2024-03-15T23:59:59.999Z');
    expect(start).toBe('2023-12-16T00:00:00.000Z');
  });

  it('builds site links keeping the historical date', () => {
    expect(getSiteUrl(5)).toBe('/sites/5');
    expect(getSiteUrl(5, null)).toBe('/sites/5');
    expect(getSiteUrl(5, 'not-a-date')).toBe('/sites/5');
    expect(getSiteUrl(5, '2024-03-15')).toBe(
      '/sites/5?date=2024-03-15&start=2024-02-15&end=2024-03-15',
    );
  });

  it('formats dates without time zone shifts', () => {
    expect(formatHistoricalDate('2024-03-01')).toBe('Mar 1, 2024');
  });
});
