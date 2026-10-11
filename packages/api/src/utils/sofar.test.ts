import {
  SOFAR_MARINE_URL,
  SOFAR_SENSOR_DATA_URL,
  SOFAR_WAVE_DATA_URL,
  SofarModels,
  sofarVariableIDs,
} from './constants';
import axios from './retry-axios';
import {
  getSofarHindcastData,
  getSpotterData,
  sofarHindcast,
  sofarWaveData,
} from './sofar';

jest.mock('./retry-axios', () => ({
  __esModule: true,
  default: { get: jest.fn() },
}));
jest.mock('./slack.utils', () => ({ sendSlackMessage: jest.fn() }));

const mockGet = jest.mocked(axios.get);
const timestamp = '2024-08-30T12:00:00.000Z';
const sensorId = 'SPOT-test';
const token = 'test-token';

beforeEach(() => {
  mockGet.mockReset();
});

test('It processes Sofar API for daily data and filters missing readings.', async () => {
  mockGet.mockResolvedValueOnce({
    data: {
      hindcastVariables: [
        {
          values: [
            { timestamp, value: 29.5 },
            { timestamp, value: null },
            { timestamp, value: 9999 },
            { timestamp, value: 0 },
          ],
        },
      ],
    },
  });
  const values = await getSofarHindcastData(
    SofarModels.NOAACoralReefWatch,
    'analysedSeaSurfaceTemperature',
    -3.5976336810301888,
    -178.0000002552476,
    new Date('2024-08-31T00:00:00.000Z'),
  );
  expect(values).toEqual([
    { timestamp, value: 29.5 },
    { timestamp, value: 0 },
  ]);
  expect(mockGet).toHaveBeenCalledWith(
    `${SOFAR_MARINE_URL}${SofarModels.NOAACoralReefWatch}/hindcast/point`,
    expect.objectContaining({
      params: expect.objectContaining({
        variableIDs: ['analysedSeaSurfaceTemperature'],
        latitude: -3.5976336810301888,
        longitude: -178.0000002552476,
        start: '2024-08-30T00:00:00.000Z',
        end: '2024-08-31T00:00:00.000Z',
      }),
    }),
  );
});

test('It processes Spotter temperatures, waves and pressure readings.', async () => {
  mockGet.mockResolvedValueOnce({
    data: {
      data: {
        waves: [
          {
            timestamp,
            significantWaveHeight: 1.2,
            meanPeriod: 5,
            meanDirection: 90,
            latitude: 1,
            longitude: 2,
          },
        ],
        surfaceTemp: [{ timestamp, degrees: 28 }],
      },
    },
  });
  mockGet.mockResolvedValueOnce({
    data: {
      data: [
        { timestamp, sensorPosition: 1, unit_type: 'temperature', value: 27 },
        { timestamp, sensorPosition: 2, unit_type: 'temperature', value: 26 },
        { timestamp, sensorPosition: 2, unit_type: 'temperature', value: null },
        { timestamp, sensorPosition: 2, unit_type: 'pressure', value: 1013000 },
        { timestamp, sensorPosition: 3, unit_type: 'temperature', value: 99 },
      ],
    },
  });
  const values = await getSpotterData(
    sensorId,
    token,
    new Date('2024-08-31T00:00:00.000Z'),
  );
  expect(values.topTemperature).toEqual([{ timestamp, value: 27 }]);
  expect(values.bottomTemperature).toEqual([{ timestamp, value: 26 }]);
  expect(values.barometerBottom).toEqual([{ timestamp, value: 1013 }]);
  expect(values.surfaceTemperature).toEqual([{ timestamp, value: 28 }]);
  expect(values.significantWaveHeight).toEqual([{ timestamp, value: 1.2 }]);
  expect(mockGet).toHaveBeenNthCalledWith(2, SOFAR_SENSOR_DATA_URL, {
    params: {
      spotterId: sensorId,
      token,
      startDate: '2024-08-30T00:00:00.000Z',
      endDate: '2024-08-31T00:00:00.000Z',
    },
  });
});

test('It extracts the requested wind-wave hindcast response.', async () => {
  const hindcast = { values: [{ timestamp, value: 1.2 }] };
  mockGet.mockResolvedValueOnce({ data: { hindcastVariables: [hindcast] } });
  expect(
    await sofarHindcast(
      SofarModels.Wave,
      sofarVariableIDs[SofarModels.Wave].significantWaveHeight,
      1,
      2,
      '2024-08-30T00:00:00.000Z',
      '2024-08-31T00:00:00.000Z',
    ),
  ).toEqual(hindcast);
});

test.each([true, false])(
  'It accepts wave data with a nested API envelope: %s.',
  async (nested) => {
    const waveData = {
      spotterId: sensorId,
      waves: [{ timestamp, significantWaveHeight: 1.2 }],
    };
    mockGet.mockResolvedValueOnce({
      data: nested ? { data: waveData } : waveData,
    });
    expect(
      await sofarWaveData(
        sensorId,
        token,
        '2024-08-30T00:00:00.000Z',
        '2024-08-31T00:00:00.000Z',
      ),
    ).toEqual({ data: waveData });
    expect(mockGet).toHaveBeenCalledWith(SOFAR_WAVE_DATA_URL, {
      params: {
        spotterId: sensorId,
        token,
        startDate: '2024-08-30T00:00:00.000Z',
        endDate: '2024-08-31T00:00:00.000Z',
        limit: 500,
        includeSurfaceTempData: true,
        includeWindData: true,
        includeBarometerData: true,
      },
    });
  },
);

test('It returns no hindcast readings when the API has a data gap.', async () => {
  mockGet.mockResolvedValueOnce({
    data: { hindcastVariables: [{ values: [] }] },
  });
  expect(
    await getSofarHindcastData(
      'model',
      'variable',
      1,
      2,
      new Date('2024-08-31T00:00:00.000Z'),
    ),
  ).toEqual([]);
});
