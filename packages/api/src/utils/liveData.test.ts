import { Reef } from '../reefs/reefs.entity';
import { getLiveData } from './liveData';

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

  const liveData = await getLiveData((reef as unknown) as Reef, true);

  expect(liveData.surfaceTemperature).toBeDefined();
});
