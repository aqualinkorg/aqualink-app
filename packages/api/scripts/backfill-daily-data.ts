import Bluebird from 'bluebird';
import yargs from 'yargs';
import { DateTime } from 'luxon';
import { Logger } from '@nestjs/common';
import {
  getSitesDailyData,
  getSitesIdsWithoutDataForDate,
} from '../src/workers/dailyData';
import AqualinkDataSource from '../ormconfig';

type Args = {
  d: number;
  s?: string[];
  m: boolean;
};

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
  .option('m', {
    alias: 'missing',
    describe: 'Backfill only missing data',
    type: 'boolean',
    default: false,
  })
  .help();

async function run() {
  const { d: days, s: sites, m: missing } = argv as Args;
  const backlogArray = Array.from(Array(days).keys());
  const siteIds =
    sites && sites.map((site) => parseInt(`${site}`, 10)).sort((a, b) => b - a);
  const today = DateTime.utc().endOf('day');
  const connection = await AqualinkDataSource.initialize();

  Logger.log(
    `Backfilling ${days} days for ${siteIds?.length ?? 'all'} sites...`,
  );
  // eslint-disable-next-line fp/no-mutating-methods
  await Bluebird.mapSeries(backlogArray.reverse(), async (past) => {
    const date = today.set({ day: today.day - past - 1 }).toJSDate();
    try {
      const filteredSiteIds = missing
        ? await getSitesIdsWithoutDataForDate(connection, date, siteIds)
        : siteIds;
      await getSitesDailyData(connection, date, filteredSiteIds);
    } catch (error) {
      console.error(error);
    }
  });
}

run();
