import { getDailyData } from './dailyData';
import { Reef } from '../reefs/reefs.entity';

test('It processes Sofar API for daily data.', async () => {
  jest.setTimeout(30000);

  const reef = {
    id: 1,
    name: null,
    polygon: {
      type: 'Polygon',
      coordinates: [-122.699036598, 37.893756314],
    },
    spotterId: 'SPOT-300434063450120',
    temperatureThreshold: null,
    depth: null,
    maxMonthlyMean: 22,
    status: 0,
    videoStream: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    timezone: 'Etc/GMT+12',
  };

  const values = await getDailyData(
    (reef as unknown) as Reef,
    new Date('2020-09-01'),
  );

  expect(values).toEqual({
    reef: { id: 1 },
    date: new Date('2020-09-01'),
    minBottomTemperature: 14.880000000000003,
    maxBottomTemperature: 15.96,
    avgBottomTemperature: 15.316388888888895,
    surfaceTemperature: 15.654583333333344,
    satelliteTemperature: 15.5299997329712,
    degreeHeatingDays: 33.879997730255106,
    minWaveHeight: 0.41,
    maxWaveHeight: 0.58,
    avgWaveHeight: 0.48270833333333335,
    waveDirection: 165,
    wavePeriod: 14,
    minWindSpeed: 1.03203940391541,
    maxWindSpeed: 3.70362329483032,
    avgWindSpeed: 2.200415010253588,
    windDirection: 35,
  });
});
