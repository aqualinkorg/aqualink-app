import { SofarModels, sofarVariableIDs } from './constants';
import {
  getSofarHindcastData,
  getSpotterData,
  sofarHindcast,
  sofarWaveData,
} from './sofar';
import { ValueWithTimestamp } from './sofar.types';

test('It processes Sofar API for daily data.', async () => {
  jest.setTimeout(30000);
  const values = await getSofarHindcastData(
    'NOAACoralReefWatch',
    'analysedSeaSurfaceTemperature',
    -3.5976336810301888,
    -178.0000002552476,
    new Date('2024-08-31'),
  );

  expect(values).toEqual([
    { timestamp: '2024-08-30T12:00:00.000Z', value: 27.70993356218372 },
  ]);
});

test('It processes Sofar Spotter API for daily data.', async () => {
  jest.setTimeout(30000);
  const values = await getSpotterData(
    'SPOT-300434063450120',
    process.env.SOFAR_API_TOKEN,
    new Date('2020-09-02'),
  );

  expect(values.bottomTemperature.length).toEqual(144);
  expect(values.topTemperature.length).toEqual(144);
});

test('it process Sofar Hindcast API for wind-wave data', async () => {
  jest.setTimeout(30000);
  const now = new Date();
  const yesterdayDate = new Date(now);
  yesterdayDate.setDate(now.getDate() - 1);
  const today = now.toISOString();
  const yesterday = yesterdayDate.toISOString();

  const response = await sofarHindcast(
    SofarModels.Wave,
    sofarVariableIDs[SofarModels.Wave].significantWaveHeight,
    -3.5976336810301888,
    -178.0000002552476,
    yesterday,
    today,
  );

  const values = response?.values[0] as ValueWithTimestamp;

  expect(new Date(values?.timestamp).getTime()).toBeLessThanOrEqual(
    now.getTime(),
  );
});

test('it process Sofar Wave Date API for surface temperature', async () => {
  jest.setTimeout(30000);
  const now = new Date();
  const yesterdayDate = new Date(now);
  yesterdayDate.setDate(now.getDate() - 1);
  const today = now.toISOString();
  const yesterday = yesterdayDate.toISOString();

  const response = await sofarWaveData(
    'SPOT-1519',
    process.env.SOFAR_API_TOKEN,
    yesterday,
    today,
  );

  const values = response && response.data.waves.length;

  expect(values).toBeGreaterThan(0);
});
