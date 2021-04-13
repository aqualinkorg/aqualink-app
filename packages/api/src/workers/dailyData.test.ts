import { getDailyData } from './dailyData';
import { Reef } from '../reefs/reefs.entity';

test('It processes Sofar API for daily data.', async () => {
  jest.setTimeout(60000);

  const date = new Date('2021-04-01');
  date.setUTCHours(23, 59, 59, 999);
  const reef = {
    id: 1,
    name: null,
    polygon: {
      type: 'Polygon',
      coordinates: [-122.699036598, 37.893756314],
    },
    spotterId: 'SPOT-300434063450120',
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
    surfaceTemperature: undefined,
    satelliteTemperature: 11.7799997329712,
    degreeHeatingDays: 0,
    minWaveHeight: undefined,
    maxWaveHeight: undefined,
    avgWaveHeight: undefined,
    waveDirection: undefined,
    wavePeriod: undefined,
    minWindSpeed: 0.198823437094688,
    maxWindSpeed: 4.18035554885864,
    avgWindSpeed: 1.6646625492721796,
    windDirection: 165,
  });
});
