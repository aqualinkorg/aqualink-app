/* eslint-disable no-param-reassign, fp/no-mutation */
import Faker from 'faker';
import { define } from 'typeorm-seeding';
import { Reef, ReefStatus } from '../reefs/reefs.entity';
import { createPoint } from '../utils/coordinates';

// Reef Factory
define(Reef, (faker: typeof Faker) => {
  const reef = new Reef();
  const statuses = [
    ReefStatus.Approved,
    ReefStatus.InReview,
    ReefStatus.Rejected,
  ] as ReefStatus[];
  reef.name = `Mock Reef ${faker.name.lastName()}`;
  const lat = faker.random.number({ min: -900, max: 900 }) / 10;
  const lng = faker.random.number({ min: -1800, max: 1800 }) / 10;
  reef.polygon = createPoint(lng, lat);
  reef.temperatureThreshold = faker.random.number({ min: 25, max: 27 });
  reef.depth = faker.random.number({ min: 10, max: 40 });
  reef.status = statuses[Math.floor(Math.random() * statuses.length)];
  return reef;
});
