import { getDailyData } from './dailyData';
import { Site } from '../sites/sites.entity';

test('It processes Sofar API for daily data.', async () => {
  jest.setTimeout(60000);

  const date = new Date('2022-06-27');
  date.setUTCHours(23, 59, 59, 999);
  const site = {
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

  const values = await getDailyData(site as unknown as Site, date, []);

  expect(values).toEqual({
    site: { id: 1 },
    date,
    dailyAlertLevel: 0,
    minBottomTemperature: undefined,
    maxBottomTemperature: undefined,
    avgBottomTemperature: undefined,
    topTemperature: undefined,
    satelliteTemperature: 14.0600004196167,
    degreeHeatingDays: 0,
    minWaveHeight: 0.602825164794922,
    maxWaveHeight: 0.688246726989746,
    avgWaveHeight: 0.6370683908462524,
    waveMeanDirection: 260,
    waveMeanPeriod: 5,
    minWindSpeed: 2.6886074446319257,
    maxWindSpeed: 5.951999598826317,
    avgWindSpeed: 3.6391123432405657,
    windDirection: 295,
  });
});
