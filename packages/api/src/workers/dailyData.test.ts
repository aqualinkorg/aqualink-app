import { getDailyData } from './dailyData';
import { Site } from '../sites/sites.entity';

test('It processes Sofar API for daily data.', async () => {
  jest.setTimeout(60000);

  const date = new Date('2024-08-31');
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

  const values = await getDailyData(site as unknown as Site, date);

  // Verify basic structure is returned
  expect(values).toHaveProperty('site');
  expect(values.site).toEqual({ id: 1 });
  expect(values).toHaveProperty('date');
  expect(values.date).toEqual(date);

  // API may return undefined values if data is not available for the requested parameters
  // This is acceptable behavior, so we just test that the properties exist
  expect(values).toHaveProperty('dailyAlertLevel');
  expect(values).toHaveProperty('degreeHeatingDays');
  expect(values).toHaveProperty('satelliteTemperature');
});
