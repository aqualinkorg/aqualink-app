import { dailyDataToSofarValues } from './helpers';
import type { DailyData } from './types';

describe('dailyDataToSofarValues', () => {
  it('uses the newest daily_data row and converts degree heating days to weeks', () => {
    const dailyData = [
      {
        date: '2024-03-15T23:59:59.000Z',
        satelliteTemperature: 30.4,
        degreeHeatingDays: 63,
        dailyAlertLevel: 4,
        weeklyAlertLevel: 3,
      },
      { date: '2024-03-14T23:59:59.000Z', satelliteTemperature: 29 },
    ] as DailyData[];

    expect(dailyDataToSofarValues(dailyData)).toEqual({
      satelliteTemperature: { value: 30.4, timestamp: dailyData[0].date },
      dhw: { value: 9, timestamp: dailyData[0].date },
      tempAlert: { value: 4, timestamp: dailyData[0].date },
      tempWeeklyAlert: { value: 3, timestamp: dailyData[0].date },
    });
  });

  it('returns no values when there is no data for the day', () => {
    expect(dailyDataToSofarValues([])).toEqual({});
  });
});
