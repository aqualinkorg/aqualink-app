import { DailyData } from 'sites/daily-data.entity';
import { DeepPartial } from 'typeorm';
import { get } from 'lodash';
import { getDailyData } from './dailyData';
import { Site } from '../sites/sites.entity';
import axios from '../utils/retry-axios';

jest.mock('../utils/retry-axios', () => ({
  __esModule: true,
  default: { get: jest.fn() },
}));
jest.mock('../utils/slack.utils', () => ({ sendSlackMessage: jest.fn() }));

test('It processes Sofar API for daily data.', async () => {
  const mockGet = jest.mocked(axios.get);
  mockGet.mockReset();
  mockGet.mockImplementation(async (_url, config) => ({
    data: {
      hindcastVariables: [
        {
          values:
            get(config, 'params.variableIDs[0]') === 'degreeHeatingWeek'
              ? [{ timestamp: '2024-08-30T12:00:00.000Z', value: 2 }]
              : [
                  { timestamp: '2024-08-30T12:00:00.000Z', value: 15.4 },
                  { timestamp: '2024-08-29T12:00:00.000Z', value: 16 },
                ],
        },
      ],
    },
  }));

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
    degreeHeatingDays: 14,
    satelliteTemperature: 15.4,
  };

  expect(values).toEqual(expected);
  expect(mockGet).toHaveBeenCalledTimes(2);
  expect(mockGet).toHaveBeenCalledWith(
    expect.stringContaining('/NOAACoralReefWatch/hindcast/point'),
    expect.objectContaining({
      params: expect.objectContaining({
        latitude: 37.893756314,
        longitude: -122.699036598,
        start: '2024-08-27T23:59:59.999Z',
        end: date.toISOString(),
      }),
    }),
  );
});
