import { Site } from '../sites/sites.entity';
import { getLiveData } from './liveData';

test('It creates a liveData object using Sofar API.', async () => {
  jest.setTimeout(30000);

  const site = {
    id: 1,
    name: null,
    polygon: {
      type: 'Polygon',
      coordinates: [-122.699036598, 37.893756314],
    },
    sensorId: 'SPOT-0795',
    depth: null,
    maxMonthlyMean: 22,
    status: 0,
    videoStream: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    timezone: 'Etc/GMT+12',
  };

  const liveData = await getLiveData(site as unknown as Site, true);

  expect(liveData.topTemperature).toBeDefined();
});
