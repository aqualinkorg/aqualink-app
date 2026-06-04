import { DailyData } from 'sites/daily-data.entity';
import { DeepPartial } from 'typeorm';
import { getDailyData } from './dailyData';
import { Site } from '../sites/sites.entity';
import { getSofarHindcastData } from '../utils/sofar';

jest.mock('../utils/sofar', () => {
  const actual = jest.requireActual('../utils/sofar');

  return {
    ...actual,
    getSofarHindcastData: jest.fn(),
  };
});

const mockGetSofarHindcastData = getSofarHindcastData as jest.MockedFunction<
  typeof getSofarHindcastData
>;

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

  mockGetSofarHindcastData
    .mockResolvedValueOnce([{ timestamp: date.toISOString(), value: 2 }])
    .mockResolvedValueOnce([{ timestamp: date.toISOString(), value: 23 }]);

  const values = await getDailyData(site as unknown as Site, date);
  const expected: DeepPartial<DailyData> = {
    site: { id: 1 },
    date,
    dailyAlertLevel: 2,
    degreeHeatingDays: 14,
    satelliteTemperature: 23,
  };

  expect(values).toEqual(expected);
});
