import { SofarModels, sofarVariableIDs } from './constants';
import axios from './retry-axios';
import {
  getSofarHindcastData,
  getSpotterData,
  sofarHindcast,
  sofarWaveData,
} from './sofar';
import { ValueWithTimestamp } from './sofar.types';

jest.mock('./retry-axios', () => ({
  __esModule: true,
  default: { get: jest.fn() },
}));

const getMock = axios.get as jest.Mock;

beforeEach(() => {
  getMock.mockReset();
});

test('It processes Sofar API for daily data.', async () => {
  getMock.mockResolvedValue({
    data: {
      hindcastVariables: [
        {
          values: [
            {
              timestamp: '2024-08-30T12:00:00.000Z',
              value: 29.509984820290786,
            },
            { timestamp: '2024-08-30T13:00:00.000Z', value: 9999 },
          ],
        },
      ],
    },
  });

  const values = await getSofarHindcastData(
    'NOAACoralReefWatch',
    'analysedSeaSurfaceTemperature',
    -3.5976336810301888,
    -178.0000002552476,
    new Date('2024-08-31'),
  );

  expect(values).toEqual([
    { timestamp: '2024-08-30T12:00:00.000Z', value: 29.509984820290786 },
  ]);
});

test('It processes Sofar Spotter API for daily data.', async () => {
  const readings = Array.from({ length: 144 }, (_, index) => ({
    timestamp: new Date(Date.UTC(2020, 8, 2, 0, index)).toISOString(),
  }));
  const smartMooringData = readings.flatMap(({ timestamp }) => [
    {
      sensorPosition: 1,
      unit_type: 'temperature',
      timestamp,
      value: 25,
    },
    {
      sensorPosition: 2,
      unit_type: 'temperature',
      timestamp,
      value: 24,
    },
  ]);

  getMock
    .mockResolvedValueOnce({
      data: {
        data: { waves: [], wind: [], barometerData: [], surfaceTemp: [] },
      },
    })
    .mockResolvedValueOnce({ data: { data: smartMooringData } });

  const values = await getSpotterData(
    'SPOT-300434063450120',
    'test-token',
    new Date('2020-09-02'),
  );

  expect(values.bottomTemperature).toHaveLength(144);
  expect(values.topTemperature).toHaveLength(144);
});

test('it process Sofar Hindcast API for wind-wave data', async () => {
  const now = new Date('2024-08-31T12:00:00.000Z');
  const yesterday = new Date('2024-08-30T12:00:00.000Z');

  getMock.mockResolvedValue({
    data: {
      hindcastVariables: [
        {
          values: [{ timestamp: '2024-08-31T06:00:00.000Z', value: 1.2 }],
        },
      ],
    },
  });

  const response = await sofarHindcast(
    SofarModels.Wave,
    sofarVariableIDs[SofarModels.Wave].significantWaveHeight,
    -3.5976336810301888,
    -178.0000002552476,
    yesterday.toISOString(),
    now.toISOString(),
  );

  const values = response?.values[0] as ValueWithTimestamp;

  expect(new Date(values?.timestamp).getTime()).toBeLessThanOrEqual(
    now.getTime(),
  );
});

test('it process Sofar Wave Date API for surface temperature', async () => {
  getMock.mockResolvedValue({
    data: {
      data: {
        waves: [
          {
            timestamp: '2024-08-31T06:00:00.000Z',
            significantWaveHeight: 1.2,
          },
        ],
      },
    },
  });

  const response = await sofarWaveData(
    'SPOT-1644',
    'test-token',
    '2024-08-30T12:00:00.000Z',
    '2024-08-31T12:00:00.000Z',
  );

  expect(response).toBeDefined();
  expect(response?.data).toBeDefined();
  expect(response?.data.waves).toBeDefined();
  expect(Array.isArray(response?.data.waves)).toBe(true);
  expect(response?.data.waves.length).toBeGreaterThan(0);
});
