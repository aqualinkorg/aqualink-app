import axios from './retry-axios';
import { SofarModels, sofarVariableIDs } from './constants';
import {
  getSofarHindcastData,
  getSpotterData,
  sofarHindcast,
  sofarWaveData,
} from './sofar';

jest.mock('./retry-axios', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
  },
}));

const mockedGet = axios.get as jest.MockedFunction<typeof axios.get>;

describe('Sofar utils', () => {
  beforeEach(() => {
    mockedGet.mockReset();
  });

  test('filters invalid hindcast values for daily data', async () => {
    mockedGet.mockResolvedValueOnce({
      data: {
        hindcastVariables: [
          {
            values: [
              { timestamp: '2024-08-30T12:00:00.000Z', value: null },
              { timestamp: '2024-08-30T18:00:00.000Z', value: 9999 },
              { timestamp: '2024-08-31T00:00:00.000Z', value: 29.51 },
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
      { timestamp: '2024-08-31T00:00:00.000Z', value: 29.51 },
    ]);
  });

  test('maps spotter and smart mooring data into spotter metrics', async () => {
    mockedGet
      .mockResolvedValueOnce({
        data: {
          data: {
            spotterId: 'SPOT-300434063450120',
            waves: [
              {
                significantWaveHeight: 1.2,
                meanPeriod: 8.5,
                meanDirection: 210,
                timestamp: '2020-09-02T00:00:00.000Z',
                latitude: -8.1,
                longitude: 115.1,
              },
            ],
            wind: [
              {
                speed: 12,
                direction: 180,
                timestamp: '2020-09-02T00:00:00.000Z',
                seasurfaceId: 1,
                latitude: -8.1,
                longitude: 115.1,
              },
            ],
            surfaceTemp: [
              {
                degrees: 28.4,
                timestamp: '2020-09-02T00:00:00.000Z',
                latitude: -8.1,
                longitude: 115.1,
              },
            ],
            barometerData: [
              {
                value: 1000,
                timestamp: '2020-09-02T00:00:00.000Z',
                latitude: -8.1,
                longitude: 115.1,
                units: 'hPa',
              },
              {
                value: 1003,
                timestamp: '2020-09-02T01:00:00.000Z',
                latitude: -8.1,
                longitude: 115.1,
                units: 'hPa',
              },
            ],
          },
        },
      })
      .mockResolvedValueOnce({
        data: {
          data: [
            {
              sensorPosition: 1,
              unit_type: 'temperature',
              value: 27.1,
              timestamp: '2020-09-02T00:00:00.000Z',
            },
            {
              sensorPosition: 2,
              unit_type: 'temperature',
              value: 26.3,
              timestamp: '2020-09-02T00:00:00.000Z',
            },
            {
              sensorPosition: 2,
              unit_type: 'pressure',
              value: 101245,
              timestamp: '2020-09-02T00:00:00.000Z',
            },
          ],
        },
      });

    const values = await getSpotterData(
      'SPOT-300434063450120',
      'token',
      new Date('2020-09-02'),
    );

    expect(values.topTemperature).toEqual([
      { timestamp: '2020-09-02T00:00:00.000Z', value: 27.1 },
    ]);
    expect(values.bottomTemperature).toEqual([
      { timestamp: '2020-09-02T00:00:00.000Z', value: 26.3 },
    ]);
    expect(values.barometerBottom).toEqual([
      { timestamp: '2020-09-02T00:00:00.000Z', value: 101.245 },
    ]);
    expect(values.barometricTopDiff).toEqual([
      { timestamp: '2020-09-02T01:00:00.000Z', value: 3 },
    ]);
    expect(values.surfaceTemperature).toEqual([
      { timestamp: '2020-09-02T00:00:00.000Z', value: 28.4 },
    ]);
    expect(values.significantWaveHeight).toEqual([
      { timestamp: '2020-09-02T00:00:00.000Z', value: 1.2 },
    ]);
  });

  test('returns the first hindcast variable payload', async () => {
    mockedGet.mockResolvedValueOnce({
      data: {
        hindcastVariables: [
          {
            variableID:
              sofarVariableIDs[SofarModels.Wave].significantWaveHeight,
            values: [{ timestamp: '2026-06-04T00:00:00.000Z', value: 1.8 }],
          },
        ],
      },
    });

    const response = await sofarHindcast(
      SofarModels.Wave,
      sofarVariableIDs[SofarModels.Wave].significantWaveHeight,
      -3.5976336810301888,
      -178.0000002552476,
      '2026-06-03T00:00:00.000Z',
      '2026-06-04T00:00:00.000Z',
    );

    expect(response).toMatchObject({
      variableID: sofarVariableIDs[SofarModels.Wave].significantWaveHeight,
      values: [{ timestamp: '2026-06-04T00:00:00.000Z', value: 1.8 }],
    });
  });

  test('unwraps wave API response data shape', async () => {
    mockedGet.mockResolvedValueOnce({
      data: {
        data: {
          spotterId: 'SPOT-1644',
          waves: [
            {
              significantWaveHeight: 1.5,
              peakPeriod: 12,
              meanPeriod: 9,
              peakDirection: 200,
              peakDirectionalSpread: 15,
              meanDirection: 190,
              meanDirectionalSpread: 20,
              timestamp: '2026-06-04T00:00:00.000Z',
              latitude: -8.1,
              longitude: 115.1,
            },
          ],
          wind: [],
          surfaceTemp: [],
          barometerData: [],
        },
      },
    });

    const response = await sofarWaveData(
      'SPOT-1644',
      'token',
      '2026-06-03T00:00:00.000Z',
      '2026-06-04T00:00:00.000Z',
    );

    expect(response?.data.spotterId).toBe('SPOT-1644');
    expect(response?.data.waves).toHaveLength(1);
    expect(response?.data.waves[0].significantWaveHeight).toBe(1.5);
  });
});
