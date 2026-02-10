import { DailyData } from 'sites/daily-data.entity';
import { DeepPartial } from 'typeorm';
import { getDailyData } from './dailyData';
import { Site } from '../sites/sites.entity';

const hasSofarToken = Boolean(process.env.SOFAR_API_TOKEN);
const testOrSkip = hasSofarToken ? test : test.skip;

testOrSkip('It processes Sofar API for daily data.', async () => {
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
  const expected: DeepPartial<DailyData> = {
    site: { id: 1 },
    date,
    dailyAlertLevel: 0,
    degreeHeatingDays: 15.397786264922775,
    satelliteTemperature: 15.419691827607394,
  };

  expect(values).toEqual(expected);
});
