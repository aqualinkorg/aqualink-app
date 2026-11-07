import {
  buildHistoricalLatestData,
  isValidHistoricalDate,
  normalizeSiteRequestArgs,
  readHistoricalDateFromUrl,
  toHistoricalEndOfDayIso,
  writeHistoricalDateToUrl,
} from './historicalDateHelpers';
import type { DailyData } from './types';

describe('historicalDateHelpers', () => {
  it('validates historical ISO calendar dates and rejects future or malformed values', () => {
    expect(isValidHistoricalDate('2024-04-15')).toBe(true);
    expect(isValidHistoricalDate('2024-02-30')).toBe(false);
    expect(isValidHistoricalDate('2099-01-01')).toBe(false);
    expect(isValidHistoricalDate('invalid')).toBe(false);
    expect(isValidHistoricalDate(null)).toBe(false);
  });

  it('reads and writes the date query parameter while preserving existing params', () => {
    window.history.replaceState(null, '', '/map?site_id=10&zoom=5');
    writeHistoricalDateToUrl('2024-04-15');
    expect(window.location.search).toBe('?site_id=10&zoom=5&date=2024-04-15');
    expect(readHistoricalDateFromUrl(window.location.search)).toBe(
      '2024-04-15',
    );

    writeHistoricalDateToUrl(null);
    expect(window.location.search).toBe('?site_id=10&zoom=5');
    expect(readHistoricalDateFromUrl(window.location.search)).toBeNull();
  });

  it('normalizes siteRequest arguments and converts dates to UTC end-of-day', () => {
    expect(normalizeSiteRequestArgs('42')).toEqual({ id: '42' });
    expect(
      normalizeSiteRequestArgs({ id: '42', date: '2024-04-15' }),
    ).toEqual({
      id: '42',
      date: '2024-04-15',
    });
    expect(toHistoricalEndOfDayIso('2024-04-15')).toBe(
      '2024-04-15T23:59:59.999Z',
    );
  });

  it('builds historical LatestData preserving the actual observation timestamp', () => {
    const rows: DailyData[] = [
      {
        id: 99,
        date: '2024-04-12T23:59:59.000Z',
        minBottomTemperature: 25,
        maxBottomTemperature: 27,
        avgBottomTemperature: 26,
        degreeHeatingDays: 21,
        topTemperature: 28,
        satelliteTemperature: 29.2,
        dailyAlertLevel: 2,
        weeklyAlertLevel: 3,
      },
    ];

    const latest = buildHistoricalLatestData(rows);
    expect(latest).toEqual([
      {
        id: 99,
        timestamp: '2024-04-12T23:59:59.000Z',
        value: 29.2,
        site: { id: 99 },
        source: 'noaa',
        metric: 'satellite_temperature',
      },
      {
        id: 99,
        timestamp: '2024-04-12T23:59:59.000Z',
        value: 3,
        site: { id: 99 },
        source: 'noaa',
        metric: 'dhw',
      },
      {
        id: 99,
        timestamp: '2024-04-12T23:59:59.000Z',
        value: 2,
        site: { id: 99 },
        source: 'noaa',
        metric: 'temp_alert',
      },
      {
        id: 99,
        timestamp: '2024-04-12T23:59:59.000Z',
        value: 3,
        site: { id: 99 },
        source: 'noaa',
        metric: 'temp_weekly_alert',
      },
    ]);
    expect(buildHistoricalLatestData([])).toEqual([]);
  });
});
