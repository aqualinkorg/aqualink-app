import Bluebird from 'bluebird';
import { createConnection } from 'typeorm';
import yargs from 'yargs';
import moment from 'moment';
import { getSitesDailyData } from '../src/workers/dailyData';
import NOAAAvailability from '../src/utils/noaa-availability';

const dbConfig = require('../ormconfig');

const { NOAA_AVAILABILITY_URL } = process.env;

const { argv } = yargs
  .scriptName('backfill-data')
  .usage('$0 <cmd> [args]')
  .option('d', {
    alias: 'days',
    describe: 'Specify how far back we should backfill',
    type: 'number',
    demandOption: true,
  })
  .option('s', {
    alias: 'sites',
    describe: 'Specify the sites which will be backfilled with data',
    type: 'array',
  })
  .help();

async function run() {
  const { d: days, s: sites } = argv;
  const backlogArray = Array.from(Array(days).keys());
  const siteIds = sites && sites.map((site) => parseInt(`${site}`, 10));
  const today = moment()
    .utc()
    .hours(23)
    .minutes(59)
    .seconds(59)
    .milliseconds(999);
  createConnection(dbConfig).then(async (connection) => {
    const noaaAvailability = new NOAAAvailability();
    await noaaAvailability.init(NOAA_AVAILABILITY_URL || '');
    // eslint-disable-next-line fp/no-mutating-methods
    await Bluebird.mapSeries(backlogArray.reverse(), async (past) => {
      const date = moment(today);
      date.day(today.day() - past - 1);
      try {
        await getSitesDailyData(
          connection,
          date.toDate(),
          noaaAvailability,
          siteIds,
        );
      } catch (error) {
        console.error(error);
      }
    });
  });
}

run();
