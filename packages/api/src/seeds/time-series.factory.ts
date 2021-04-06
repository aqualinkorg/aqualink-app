import Faker from 'faker';
import { define } from 'typeorm-seeding';
import { TimeSeries } from '../time-series/time-series.entity';

define(TimeSeries, (faker: typeof Faker) => {
  const timeSeries = new TimeSeries();
  const timestamp = faker.date.past(1);
  const value = faker.random.number(100);

  timeSeries.timestamp = timestamp;
  timeSeries.value = value;
  return timeSeries;
});
