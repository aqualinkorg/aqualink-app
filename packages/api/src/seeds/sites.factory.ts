import Faker from 'faker';
import { define } from 'typeorm-seeding';
import { Site, SiteStatus } from '../sites/sites.entity';
import { createPoint } from '../utils/coordinates';

// Site Factory
define(Site, (faker: typeof Faker) => {
  const site = new Site();
  const statuses = [
    SiteStatus.Approved,
    SiteStatus.InReview,
    SiteStatus.Rejected,
  ] as SiteStatus[];
  site.name = `Mock Site ${faker.name.lastName()}`;
  const lat = faker.random.number({ min: -900, max: 900 }) / 10;
  const lng = faker.random.number({ min: -1800, max: 1800 }) / 10;
  site.polygon = createPoint(lng, lat);
  site.depth = faker.random.number({ min: 10, max: 40 });
  site.status = statuses[Math.floor(Math.random() * statuses.length)];
  return site;
});
