import { getDailyData } from './dailyData';
import { Site } from '../sites/sites.entity';

test('It processes Sofar API for daily data.', async () => {
  jest.setTimeout(60000);

  const date = new Date('2021-12-01');
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
    satelliteTemperature: 13.5900001525879,
    degreeHeatingDays: 54.66999959945678,
    minWaveHeight: 1.40074372291565,
    maxWaveHeight: 1.88541984558105,
    avgWaveHeight: 1.6570496062437696,
    waveMeanDirection: 280,
    waveMeanPeriod: 9,
    minWindSpeed: 0.7573268278485021,
    maxWindSpeed: 3.369370754458181,
    avgWindSpeed: 2.037785290559487,
    windDirection: 98,
  });
});
