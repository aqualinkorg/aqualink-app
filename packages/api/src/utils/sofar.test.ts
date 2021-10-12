import { SofarModels, sofarVariableIDs } from './constants';
import { getSofarHindcastData, getSpotterData, sofarForecast } from './sofar';

test('It processes Sofar API for daily data.', async () => {
  jest.setTimeout(30000);
  const values = await getSofarHindcastData(
    'NOAACoralSiteWatch',
    'analysedSeaSurfaceTemperature',
    -3.5976336810301888,
    -178.0000002552476,
    new Date('2021-08-06'),
  );

  expect(values).toEqual([
    { timestamp: '2021-08-05T12:00:00.000Z', value: 28.8099994659424 },
  ]);
});

test('It processes Sofar Spotter API for daily data.', async () => {
  jest.setTimeout(30000);
  const values = await getSpotterData(
    'SPOT-300434063450120',
    new Date('2020-09-02'),
  );

  expect(values.bottomTemperature.length).toEqual(144);
  expect(values.topTemperature.length).toEqual(144);
});

test('it process Sofar Forecast API for live data', async () => {
  jest.setTimeout(30000);
  const now = new Date();
  const values = await sofarForecast(
    SofarModels.GFS,
    sofarVariableIDs[SofarModels.GFS].magnitude10MeterWind,
    -3.5976336810301888,
    -178.0000002552476,
  );

  expect(new Date(values.timestamp).getTime()).toBeLessThanOrEqual(
    now.getTime(),
  );
});
