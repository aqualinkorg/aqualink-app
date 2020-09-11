import { getDailyData } from './dailyData';
import { Reef } from '../reefs/reefs.entity';

test('It processes Sofar API for daily data.', async () => {
  jest.setTimeout(60000);

  const date = new Date('2020-09-01');
  date.setUTCHours(0, 0, 0, 0);
  const reef = {
    id: 1,
    name: null,
    polygon: {
      type: 'Polygon',
      coordinates: [-122.699036598, 37.893756314],
    },
    spotterId: 'SPOT-300434063450120',
    temperatureThreshold: null,
    depth: null,
    maxMonthlyMean: 22,
    status: 0,
    videoStream: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    timezone: 'Etc/GMT+12',
  };

  const values = await getDailyData((reef as unknown) as Reef, date);

  expect(values).toEqual({
    reef: { id: 1 },
    date,
    minBottomTemperature: 15.119999999999997,
    maxBottomTemperature: 16.520000000000003,
    avgBottomTemperature: 15.743888888888888,
    surfaceTemperature: 16.41305555555556,
    satelliteTemperature: 15.1800003051758,
    degreeHeatingDays: 32.61999893188477,
    minWaveHeight: 0.38,
    maxWaveHeight: 0.61,
    avgWaveHeight: 0.5035416666666668,
    waveDirection: 166,
    wavePeriod: 14,
    minWindSpeed: 0.938294887542725,
    maxWindSpeed: 3.89210629463196,
    avgWindSpeed: 2.1961769064267473,
    windDirection: 91,
  });
});
