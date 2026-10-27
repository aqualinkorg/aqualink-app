import { mockSite } from 'mocks/mockSite';
import {
  changeHistoricalDate,
  historicalAlertColor,
  historicalDateError,
  historicalDayRange,
  isHistoricalDate,
  withHistoricalDate,
} from './historicalDate';

describe('historical calendar contract', () => {
  it('accepts leap days but rejects rollover, timestamps, duplicate and future dates', () => {
    expect(isHistoricalDate('2024-02-29')).toBe(true);
    [
      '2023-02-29',
      '2024-04-31',
      '2024-1-2',
      '2024-01-02T00:00:00Z',
      '9999-01-01',
    ].forEach((date) => {
      expect(isHistoricalDate(date)).toBe(false);
    });
    expect(
      historicalDateError('?date=2024-01-02&date=2024-01-03'),
    ).toBeTruthy();
    expect(historicalDateError('?date=')).toBeTruthy();
    expect(historicalDateError('')).toBeUndefined();
  });
  it('preserves map focus and repeated filters when the date changes or clears', () => {
    const search =
      '?site_id=12&zoom=8&heatStress=0&heatStress=3&date=2024-01-01';
    const changed = new URLSearchParams(
      changeHistoricalDate(search, '2024-02-29'),
    );
    expect(changed.getAll('heatStress')).toEqual(['0', '3']);
    expect(changed.get('site_id')).toBe('12');
    expect(changed.get('zoom')).toBe('8');
    expect(changed.get('date')).toBe('2024-02-29');
    expect(
      new URLSearchParams(changeHistoricalDate(changed.toString())).has('date'),
    ).toBe(false);
    expect(withHistoricalDate('/sites/12', '2024-02-29')).toBe(
      '/sites/12?date=2024-02-29',
    );
    expect(withHistoricalDate('/sites/12')).toBe('/sites/12');
  });
  it('bounds a 90-day chart at the selected UTC day, across a year boundary', () => {
    expect(historicalDayRange('2024-01-02')).toEqual({
      start: '2023-10-05T00:00:00.000Z',
      end: '2024-01-02T23:59:59.999Z',
    });
  });
  it('distinguishes a missing historical alert from a measured zero', () => {
    expect(
      historicalAlertColor({
        ...mockSite,
        historicalDate: '2024-01-02',
        collectionData: {},
      }),
    ).toBe('#808080');
    expect(
      historicalAlertColor({
        ...mockSite,
        historicalDate: '2024-01-02',
        collectionData: { tempWeeklyAlert: 0 },
      }),
    ).toBe('#C6E5FA');
  });
});
