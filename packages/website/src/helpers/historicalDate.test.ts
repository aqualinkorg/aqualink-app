import {
  formatHistoricalDate,
  getHistoricalDateFromSearch,
  isValidHistoricalDate,
  todayUtc,
  withHistoricalDate,
} from './historicalDate';

describe('historicalDate helpers', () => {
  it('accepts past and current YYYY-MM-DD days', () => {
    expect(isValidHistoricalDate('2024-03-15')).toBe(true);
    expect(isValidHistoricalDate(todayUtc())).toBe(true);
  });

  it('rejects malformed, impossible and future dates', () => {
    [
      undefined,
      null,
      '',
      'yesterday',
      '2024-3-15',
      '2024-02-30',
      '2024-03-15T00:00:00Z',
      '2999-01-01',
    ].forEach((value) => expect(isValidHistoricalDate(value)).toBe(false));
  });

  it('reads the date from a search string', () => {
    expect(getHistoricalDateFromSearch('?zoom=4&date=2024-03-15')).toBe(
      '2024-03-15',
    );
    expect(getHistoricalDateFromSearch('?date=nope')).toBeUndefined();
    expect(getHistoricalDateFromSearch('')).toBeUndefined();
  });

  it('adds the date to links only when there is one', () => {
    expect(withHistoricalDate('/sites/1', '2024-03-15')).toBe(
      '/sites/1?date=2024-03-15',
    );
    expect(withHistoricalDate('/sites/1', undefined)).toBe('/sites/1');
  });

  it('formats the date in UTC', () => {
    expect(formatHistoricalDate('2024-03-15')).toBe('Mar 15, 2024');
  });
});
