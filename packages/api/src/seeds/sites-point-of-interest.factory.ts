import Faker from 'faker';
import { define } from 'typeorm-seeding';
import { SitePointOfInterest } from '../site-pois/site-pois.entity';

define(SitePointOfInterest, (faker: typeof Faker) => {
  const sitePointOfInterest = new SitePointOfInterest();

  sitePointOfInterest.name = `Mock Site Point Of Interest ${faker.name.lastName()}`;

  return sitePointOfInterest;
});
