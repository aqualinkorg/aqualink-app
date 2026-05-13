import { SofarModels, sofarVariableIDs } from './constants';
import {
  getSofarHindcastData,
  getSpotterData,
  sofarHindcast,
  sofarWaveData,
} from './sofar';
import { ValueWithTimestamp } from './sofar.types';

const hasSofarToken = !!process.env.SOFAR_API_TOKEN;

const testOrSkip = hasSofarToken ? test : test.skip;

testOrSkip('It processes Sofar API for daily data.', async () => {
  jest.setTimeout(30000);
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

testOrSkip('It processes Sofar Spotter API for daily data.', async () => {
  jest.setTimeout(30000);
  const values = await getSpotterData(
    'SPOT-300434063450120',
    new Date('2024-08-30'),
    new Date('2024-08-31'),
  );

  expect(values.bottomTemperature.length).toEqual(144);
  expect(values.topTemperature.length).toEqual(144);
});

testOrSkip('it process Sofar Hindcast API for wind-wave data', async () => {
  jest.setTimeout(30000);
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const response = await sofarHindcast(
    SofarModels.GFSWave,
    sofarVariableIDs[SofarModels.GFSWave].significantWaveHeight,
    9.836944,
    -84.068056,
    yesterday,
    now,
  );

  const values = response?.values[0] as ValueWithTimestamp;

  expect(new Date(values?.timestamp).getTime()).toBeLessThanOrEqual(
    now.getTime(),
  );
});

testOrSkip(
  'it process Sofar Wave Date API for surface temperature',
  async () => {
    jest.setTimeout(30000);
    const now = new Date();
    const yesterdayDate = new Date(now);
    yesterdayDate.setDate(now.getDate() - 1);
    const today = now.toISOString();
    const yesterday = yesterdayDate.toISOString();

    const response = await sofarWaveData(
      'SPOT-1644',
      process.env.SOFAR_API_TOKEN,
      yesterday,
      today,
    );

    expect(response).toBeDefined();
    expect(response?.data).toBeDefined();
    expect(response?.data.waves).toBeDefined();
    expect(Array.isArray(response?.data.waves)).toBe(true);
    expect(response?.data.waves.length).toBeGreaterThan(0);
  },
);
