import { times } from 'lodash';
import { DailyData } from 'store/Sites/types';

const now = new Date();
const minutesAgo = 5;
export const dailyDataDate = new Date(
  now.getTime() - minutesAgo * 60000,
).toISOString();

export const mockDailyData: DailyData = {
  id: 1,
  date: dailyDataDate,
  minBottomTemperature: 25,
  maxBottomTemperature: 27,
  avgBottomTemperature: 26,
  degreeHeatingDays: 29,
  topTemperature: 36,
  satelliteTemperature: 20,
  minWaveHeight: 1,
  maxWaveHeight: 3,
  avgWaveHeight: 2,
  waveMeanDirection: 136,
  waveMeanPeriod: 15,
  minWindSpeed: 3,
  maxWindSpeed: 5,
  avgWindSpeed: 4,
  windDirection: 96,
  weeklyAlertLevel: 3,
};

export const mockTempWeeklyAlert = {
  timestamp: dailyDataDate.toString(),
  value: 3,
};

export const getMockDailyData = (days: number): DailyData[] => {
  const data = times(days, (i) => ({
    ...mockDailyData,
    id: i + 1,
    date: new Date(
      now.getTime() - (minutesAgo + i * 24 * 60) * 60000,
    ).toISOString(),
  }));
  return data;
};
