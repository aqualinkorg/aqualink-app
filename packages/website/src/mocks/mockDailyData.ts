import { DailyData } from "../store/Reefs/types";

const now = new Date();
const minutesAgo = 5;
const dailyDataDate = new Date(
  now.getTime() - minutesAgo * 60000
).toISOString();

export const mockDailyData: DailyData = {
  id: 1,
  date: dailyDataDate,
  minBottomTemperature: 25,
  maxBottomTemperature: 27,
  avgBottomTemperature: 26,
  degreeHeatingDays: 29,
  surfaceTemperature: 36,
  satelliteTemperature: 20,
  minWaveHeight: 1,
  maxWaveHeight: 3,
  avgWaveHeight: 2,
  waveDirection: 136,
  wavePeriod: 15,
  minWindSpeed: 3,
  maxWindSpeed: 5,
  avgWindSpeed: 4,
  windDirection: 96,
  weeklyAlertLevel: 3,
};
