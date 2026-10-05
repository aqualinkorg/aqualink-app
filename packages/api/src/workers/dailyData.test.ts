import { DailyData } from 'sites/daily-data.entity';
import { DeepPartial } from 'typeorm';
import { getDailyData } from './dailyData';
import { Site } from '../sites/sites.entity';
import { getSofarHindcastData } from '../utils/sofar';

jest.mock('../utils/sofar', () => ({
  ...jest.requireActual('../utils/sofar'),
  getSofarHindcastData: jest.fn(),
}));

const getSofarHindcastDataMock = getSofarHindcastData as jest.Mock;

beforeEach(() => {
  getSofarHindcastDataMock.mockReset();
});

test('It processes Sofar API for daily data.', async () => {
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

  getSofarHindcastDataMock
    .mockResolvedValueOnce([
      {
        timestamp: '2024-08-31T12:00:00.000Z',
        value: 2.199683752131825,
      },
    ])
    .mockResolvedValueOnce([
      {
        timestamp: '2024-08-31T12:00:00.000Z',
        value: 15.419691827607394,
      },
    ]);

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
