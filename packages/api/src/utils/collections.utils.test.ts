import { dailyDataToCollectionData } from './collections.utils';

describe('dailyDataToCollectionData', () => {
  it('maps a daily_data row to collection data, converting degree heating days to weeks', () => {
    expect(
      dailyDataToCollectionData({
        satelliteTemperature: 29.4,
        degreeHeatingDays: 28,
        dailyAlertLevel: 2,
        weeklyAlertLevel: 3,
      }),
    ).toEqual({
      satelliteTemperature: 29.4,
      dhw: 4,
      tempAlert: 2,
      tempWeeklyAlert: 3,
    });
  });

  it('keeps zero values and drops missing ones', () => {
    expect(
      dailyDataToCollectionData({
        satelliteTemperature: null,
        degreeHeatingDays: 0,
        dailyAlertLevel: 0,
        weeklyAlertLevel: null,
      }),
    ).toEqual({ dhw: 0, tempAlert: 0 });
  });
});
