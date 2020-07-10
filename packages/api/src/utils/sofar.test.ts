import { getSofarDailyData } from './sofar';

test('Test', async () => {
  jest.setTimeout(30000);
  const values = await getSofarDailyData(
    'HYCOM',
    'HYCOM-seaSurfaceTemperature',
    -3.5976336810301888,
    -178.0000002552476,
    new Date('2020-07-07'),
  );
  expect(values).toEqual(28.95);
});
