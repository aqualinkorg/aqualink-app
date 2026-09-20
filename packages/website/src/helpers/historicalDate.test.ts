import { DateTime } from 'luxon-extensions';
import {
  getHistoricalCardData,
  isHistoricalDateParam,
  todayDateParam,
} from './historicalDate';

describe('todayDateParam', () => {
  it('returns today as YYYY-MM-DD', () => {
    expect(todayDateParam()).toBe(DateTime.now().toFormat('yyyy-MM-dd'));
  });
});

describe('isHistoricalDateParam', () => {
  it('accepts a past calendar date', () => {
    expect(isHistoricalDateParam('2024-04-15')).toBe(true);
  });

  it('accepts today', () => {
    expect(isHistoricalDateParam(todayDateParam())).toBe(true);
  });

  it('rejects a future date', () => {
    const tomorrow = DateTime.now().plus({ days: 1 }).toFormat('yyyy-MM-dd');
    expect(isHistoricalDateParam(tomorrow)).toBe(false);
  });

  it('rejects malformed or non-date values', () => {
    ['2024/04/15', '15-04-2024', 'not-a-date', '2024-13-40', ''].forEach(
      (value) => expect(isHistoricalDateParam(value)).toBe(false),
    );
  });
});

describe('getHistoricalCardData', () => {
  it('maps stored collection metrics to card values with the observation timestamp', () => {
    const result = getHistoricalCardData({
      observationDate: '2024-04-10T00:00:00.000Z',
      dhw: 1.5,
      satelliteTemperature: 29.5,
      tempAlert: 2,
      tempWeeklyAlert: 3,
    });

    expect(result).toEqual({
      dhw: { value: 1.5, timestamp: '2024-04-10T00:00:00.000Z' },
      satelliteTemperature: {
        value: 29.5,
        timestamp: '2024-04-10T00:00:00.000Z',
      },
      tempAlert: { value: 2, timestamp: '2024-04-10T00:00:00.000Z' },
      tempWeeklyAlert: { value: 3, timestamp: '2024-04-10T00:00:00.000Z' },
    });
  });

  it('omits metrics that are not stored', () => {
    const result = getHistoricalCardData({
      observationDate: '2024-04-10T00:00:00.000Z',
      satelliteTemperature: 29.5,
    });

    expect(result.dhw).toBeUndefined();
    expect(result.satelliteTemperature?.value).toBe(29.5);
  });

  it('returns empty data when there is no historical observation', () => {
    expect(getHistoricalCardData(undefined)).toEqual({});
    expect(getHistoricalCardData({ dhw: 1 })).toEqual({});
  });
});
