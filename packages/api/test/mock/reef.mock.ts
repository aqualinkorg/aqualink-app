import { DeepPartial } from 'typeorm';
import { Reef, ReefStatus } from '../../src/reefs/reefs.entity';
import { createPoint } from '../../src/utils/coordinates';
import { users } from './user.mock';

export const reefs: DeepPartial<Reef>[] = [
  {
    id: 1,
    name: 'California Site',
    sensorId: 'SPOT-0930',
    polygon: createPoint(-113.79279081056211, 25.085598897064777),
    depth: 43,
    status: ReefStatus.Deployed,
    maxMonthlyMean: 33.54,
    timezone: 'America/Los_Angeles',
    approved: true,
    admins: users,
  },
];
