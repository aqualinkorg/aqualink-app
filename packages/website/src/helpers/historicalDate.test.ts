import { Settings } from 'luxon';
import { getHistoricalCardData } from './historicalDate';

describe('historical card observation dates', () => {
  test.each(['UTC', 'Pacific/Kiritimati', 'Etc/GMT+12'])(
    'preserves the source timestamp in %s',
    (zone) => {
      const originalZone = Settings.defaultZone;
      Settings.defaultZone = zone;
      try {
        const observationDate = '2024-04-10T23:59:59.999Z';
        const data = getHistoricalCardData({
          observationDate,
          satelliteTemperature: 28,
          dhw: 0,
          tempAlert: 0,
          tempWeeklyAlert: 1,
        });
        expect(data.satelliteTemperature).toEqual({
          value: 28,
          timestamp: observationDate,
        });
        expect(Object.values(data).map((metric) => metric.timestamp)).toEqual(
          Array(4).fill(observationDate),
        );
      } finally {
        Settings.defaultZone = originalZone;
      }
    },
  );

  test('does not relabel undated or missing observations', () => {
    expect(getHistoricalCardData()).toEqual({});
    expect(getHistoricalCardData({ satelliteTemperature: 28 })).toEqual({});
  });
});
