import { createConnection } from 'typeorm';
// eslint-disable-next-line import/no-extraneous-dependencies
import yargs from 'yargs';
import { getReefsDailyData } from '../src/workers/dailyData';

const dbConfig = require('../ormconfig');

const { argv } = yargs
  .scriptName('backfill-data')
  .usage('$0 <cmd> [args]')
  .option('d', {
    alias: 'days',
    describe: 'Specify how far back we should backfill',
    type: 'number',
  })
  .required('d')
  .help();

async function run() {
  const { days } = argv;
  const backlogArray = Array.from(Array(days).keys());
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  createConnection(dbConfig).then(async (connection) => {
    await Promise.all(
      backlogArray.map(async (past) => {
        const date = new Date(today);
        date.setDate(today.getDate() - past);
        try {
          await getReefsDailyData(connection, date);
        } catch (error) {
          console.error(error);
        }
      }),
    );
  });
}

run();
