import { getDailyData } from './dailyData';
import { Reef } from '../reefs/reefs.entity';

test('It processes Sofar API for daily data.', async () => {
  jest.setTimeout(30000);

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

  const values = await getDailyData(
    (reef as unknown) as Reef,
    new Date('2020-09-01'),
  );

  expect(values).toEqual({
    reef: { id: 1 },
    date: new Date('2020-09-01'),
    minBottomTemperature: 14.880000000000003,
    maxBottomTemperature: 16.119999999999997,
    avgBottomTemperature: 15.535833333333345,
    surfaceTemperature: 15.903611111111116,
    satelliteTemperature: 15.1800003051758,
    degreeHeatingDays: 32.61999893188477,
    minWaveHeight: 0.38,
    maxWaveHeight: 0.6,
    avgWaveHeight: 0.5129166666666666,
    waveDirection: 165,
    wavePeriod: 14,
    minWindSpeed: 1.01691806316376,
    maxWindSpeed: 3.89210629463196,
    avgWindSpeed: 2.291687205433847,
    windDirection: 2,
  });
});
