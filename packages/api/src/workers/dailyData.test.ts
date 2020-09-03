import { getDailyData } from './dailyData';
import { Reef } from '../reefs/reefs.entity';

test('It processes Sofar API for daily data.', async () => {
  jest.setTimeout(30000);

  const reef = {
    id: 1,
    name: null,
    spotterId: null,
    polygon: {
      type: 'Polygon',
      coordinates: [0, 0],
    },
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
    new Date('2020-07-07'),
  );

  expect(values).toEqual({
    reef: { id: 1 },
    date: new Date('2020-07-07'),
    minBottomTemperature: undefined,
    maxBottomTemperature: undefined,
    avgBottomTemperature: undefined,
    surfaceTemperature: undefined,
    satelliteTemperature: 25.3570003509521,
    degreeHeatingDays: 0,
    minWaveHeight: 1.54999995231628,
    maxWaveHeight: 1.76999998092651,
    avgWaveHeight: 1.6612500001986812,
    waveDirection: undefined,
    wavePeriod: 16,
    minWindSpeed: 3.30057072639465,
    maxWindSpeed: 5.5790114402771,
    avgWindSpeed: 4.660314430793126,
    windDirection: 5,
  });
});
