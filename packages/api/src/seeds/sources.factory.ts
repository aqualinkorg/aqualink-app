import Faker from 'faker';
import { define } from 'typeorm-seeding';
import { Sources } from '../reefs/sources.entity';

define(Sources, (faker: typeof Faker) => {
  const source = new Sources();
  source.depth = faker.random.number(100);
  return source;
});
