import { createConnection, In } from 'typeorm';
import Bluebird from 'bluebird';
import { Point } from 'geojson';
import { Reef } from '../src/reefs/reefs.entity';
import { getNOAAData } from './utils/netcdf';
import { DailyData } from '../src/reefs/daily-data.entity';

const dbConfig = require('../ormconfig');

const reefsToProcess = [];

async function main() {
  const connection = await createConnection(dbConfig);
  const reefRepository = connection.getRepository(Reef);
  const dailyDataRepository = connection.getRepository(DailyData);
  const selectedReefs = await reefRepository.find({
    where:
      reefsToProcess.length > 0
        ? {
            id: In(reefsToProcess),
          }
        : {},
  });

  const dailyDataEntities = selectedReefs.reduce(
    (entities: DailyData[], reef) => {
      console.log(`Processing reef ${reef.name || reef.id}...`);
      const allYearEntities = [2017, 2018, 2019, 2020].reduce(
        (yearEntities: DailyData[], year) => {
          console.log(`Processing year ${year}...`);
          const [longitude, latitude] = (reef.polygon as Point).coordinates;
          const data = getNOAAData(year, longitude, latitude);
          const yearEntitiesForReef = data.map(
            ({ date, satelliteTemperature }) =>
              ({
                reef: { id: reef.id },
                date,
                satelliteTemperature,
              } as DailyData),
          );
          return yearEntities.concat(yearEntitiesForReef);
        },
        [],
      );
      return entities.concat(allYearEntities);
    },
    [],
  );

  await Bluebird.map(dailyDataEntities, async (entity) => {
    try {
      await dailyDataRepository.save(entity);
    } catch (err) {
      if (err.constraint === 'no_duplicated_date') {
        console.debug(
          `Data already exists for this date ${entity.date.toDateString()}`,
        );
      } else {
        console.error(err);
      }
    }
    dailyDataRepository.create(entity);
  });

  connection.close();
  process.exit(0);
}

main();
