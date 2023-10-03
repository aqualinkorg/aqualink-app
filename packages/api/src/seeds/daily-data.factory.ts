/* eslint-disable no-param-reassign, fp/no-mutation */
import Faker from 'faker';
import { define } from 'typeorm-seeding';
import { DailyData } from '../sites/daily-data.entity';

define(DailyData, (faker: typeof Faker) => {
  const dailyData = new DailyData();
  dailyData.date = faker.date.past(1);

  dailyData.degreeHeatingDays = faker.random.number({ min: 20, max: 40 });
  dailyData.satelliteTemperature = faker.random.number({ min: 20, max: 40 });

  return dailyData;
});
