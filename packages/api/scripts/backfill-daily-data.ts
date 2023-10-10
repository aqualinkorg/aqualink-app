import Bluebird from 'bluebird';
import yargs from 'yargs';
import { DateTime } from 'luxon';
import { getSitesDailyData } from '../src/workers/dailyData';
import AqualinkDataSource from '../ormconfig';

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
  const today = DateTime.utc().endOf('day');
  const connection = await AqualinkDataSource.initialize();
  // eslint-disable-next-line fp/no-mutating-methods
  await Bluebird.mapSeries(backlogArray.reverse(), async (past) => {
    const date = today.set({ day: today.day - past - 1 });
    try {
      await getSitesDailyData(connection, date.toJSDate(), siteIds);
    } catch (error) {
      console.error(error);
    }
  });
}

run();
