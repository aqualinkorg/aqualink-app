import { getDailyData } from './dailyData';
import { Site } from '../sites/sites.entity';

test('It processes Sofar API for daily data.', async () => {
  jest.setTimeout(60000);

  const date = new Date('2022-03-07');
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
    satelliteTemperature: 10.7700004577637,
    degreeHeatingDays: 0,
    minWaveHeight: 1.18205952644348,
    maxWaveHeight: 1.98118472099304,
    avgWaveHeight: 1.5180400510629015,
    waveMeanDirection: 291,
    waveMeanPeriod: 7,
    minWindSpeed: 1.3530414402214594,
    maxWindSpeed: 5.570303083245357,
    avgWindSpeed: 3.130121028412539,
    windDirection: 227,
  });
});
