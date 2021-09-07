import { getDailyData } from './dailyData';
import { Reef } from '../reefs/reefs.entity';

test('It processes Sofar API for daily data.', async () => {
  jest.setTimeout(60000);

  const date = new Date('2021-08-01');
  date.setUTCHours(23, 59, 59, 999);
  const reef = {
    id: 1,
    name: null,
    polygon: {
      type: 'Polygon',
      coordinates: [-122.699036598, 37.893756314],
    },
    sensorId: 'SPOT-300434063450120',
    depth: null,
    maxMonthlyMean: 22,
    status: 0,
    videoStream: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    timezone: 'Etc/GMT+12',
  };

  const values = await getDailyData((reef as unknown) as Reef, date, []);

  expect(values).toEqual({
    reef: { id: 1 },
    date,
    dailyAlertLevel: 0,
    minBottomTemperature: undefined,
    maxBottomTemperature: undefined,
    avgBottomTemperature: undefined,
    topTemperature: undefined,
    satelliteTemperature: 16.0400009155273,
    degreeHeatingDays: 14.13999986648557,
    minWaveHeight: 0.826433181762695,
    maxWaveHeight: 0.902798652648926,
    avgWaveHeight: 0.8645887772242228,
    waveDirection: 1,
    wavePeriod: undefined,
    minWindSpeed: 1.60820293426514,
    maxWindSpeed: 4.004723072052,
    avgWindSpeed: 2.6666289617617926,
    windDirection: 39,
  });
});
