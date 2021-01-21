import Bluebird from 'bluebird';
import { createConnection } from 'typeorm';
import yargs from 'yargs';
import moment from 'moment';
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
  .option('r', {
    alias: 'reefs',
    describe: 'Specify the reefs which will be backfilled with data',
    type: 'array',
  })
  .required('d')
  .help();

async function run() {
  const { d: days, r: reefs } = argv;
  const backlogArray = Array.from(Array(days).keys());
  const reefIds = reefs && reefs.map((reef) => parseInt(`${reef}`, 10));
  const today = moment().utc();
  today.hours(23).minutes(59).seconds(59).milliseconds(999);
  createConnection(dbConfig).then(async (connection) => {
    await Bluebird.mapSeries(backlogArray.reverse(), async (past) => {
      const date = moment(today);
      date.day(today.day() - past - 1);
      try {
        await getReefsDailyData(connection, date.toDate(), reefIds);
      } catch (error) {
        console.error(error);
      }
    });
  });
}

run();
