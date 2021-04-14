import { Reef } from '../reefs/reefs.entity';
import { getLiveData } from './liveData';

test('It creates a liveData object using Sofar API.', async () => {
  jest.setTimeout(30000);

  const reef = {
    id: 1,
    name: null,
    polygon: {
      type: 'Polygon',
      coordinates: [-122.699036598, 37.893756314],
    },
    spotterId: 'SPOT-0795',
    depth: null,
    maxMonthlyMean: 22,
    status: 0,
    videoStream: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    timezone: 'Etc/GMT+12',
  };

  const liveData = await getLiveData((reef as unknown) as Reef, true);

  expect(liveData.topTemperature).toBeDefined();
});
