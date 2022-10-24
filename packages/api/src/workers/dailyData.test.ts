import { getDailyData } from './dailyData';
import { Site } from '../sites/sites.entity';
import { TestService } from '../../test/test.service';

test('It processes Sofar API for daily data.', async () => {
  jest.setTimeout(60000);
  const testService = TestService.getInstance();
  const noaaAvailability = await testService.getNOAAAvailability();

  const date = new Date('2022-08-31');
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

  const values = await getDailyData(
    site as unknown as Site,
    date,
    [],
    noaaAvailability,
  );

  expect(values).toEqual({
    site: { id: 1 },
    date,
    avgBottomTemperature: undefined,
    avgWaveHeight: undefined,
    avgWindSpeed: 2.462633571849366,
    dailyAlertLevel: 0,
    degreeHeatingDays: 21.206205519211903,
    maxBottomTemperature: undefined,
    maxWaveHeight: undefined,
    maxWindSpeed: 5.820930032101256,
    minBottomTemperature: undefined,
    minWaveHeight: undefined,
    minWindSpeed: 1.1440491369818266,
    satelliteTemperature: 16.029768748901425,
    topTemperature: undefined,
    waveMeanDirection: undefined,
    waveMeanPeriod: undefined,
    windDirection: 278,
  });
});
