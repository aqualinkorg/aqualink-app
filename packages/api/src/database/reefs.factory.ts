/* eslint-disable no-param-reassign, fp/no-mutation */
import Faker from 'faker';
import { define } from 'typeorm-seeding';
import { Reef } from '../reefs/reefs.entity';
import { DailyData } from '../reefs/daily-data.entity';

// Reef Factory
define(Reef, (faker: typeof Faker) => {
  const reef = new Reef();
  reef.name = `Mock Reef ${faker.name.lastName()}`;
  const lat = faker.random.number({ min: -900, max: 900 }) / 10;
  const lng = faker.random.number({ min: -1800, max: 1800 }) / 10;
  reef.polygon = {
    type: 'Point',
    coordinates: [lng, lat],
  };
  reef.temperatureThreshold = faker.random.number({ min: 25, max: 27 });
  reef.depth = faker.random.number({ min: 10, max: 40 });
  reef.status = faker.random.number(1);
  return reef;
});

define(DailyData, (faker: typeof Faker) => {
  const dailyData = new DailyData();
  dailyData.date = faker.date.past(1);

  const avgBottomTemperature = faker.random.number({ min: 20, max: 40 });
  dailyData.minBottomTemperature = avgBottomTemperature - 1;
  dailyData.maxBottomTemperature = avgBottomTemperature + 1;
  dailyData.avgBottomTemperature = avgBottomTemperature;

  dailyData.degreeHeatingDays = faker.random.number({ min: 20, max: 40 });
  dailyData.surfaceTemperature = faker.random.number({ min: 20, max: 40 });
  dailyData.satelliteTemperature = faker.random.number({ min: 20, max: 40 });

  const avgWaveHeight = faker.random.number({ min: 2, max: 4 });
  dailyData.minWaveHeight = avgWaveHeight - 1;
  dailyData.maxWaveHeight = avgWaveHeight + 1;
  dailyData.avgWaveHeight = avgWaveHeight;
  dailyData.waveDirection = faker.random.number({ min: 0, max: 360 });
  dailyData.wavePeriod = faker.random.number({ min: 10, max: 30 });

  const avgWindSpeed = faker.random.number({ min: 2, max: 4 });
  dailyData.minWindSpeed = avgWindSpeed - 1;
  dailyData.maxWindSpeed = avgWindSpeed + 1;
  dailyData.avgWindSpeed = avgWindSpeed;
  dailyData.windDirection = faker.random.number({ min: 0, max: 360 });

  return dailyData;
});
