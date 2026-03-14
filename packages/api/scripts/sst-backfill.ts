import yargs from 'yargs/yargs';
import Bluebird from 'bluebird';
import { backfillSiteData } from '../src/workers/backfill-site-data';
import { updateSST } from '../src/utils/sst-time-series';
import { Site } from '../src/sites/sites.entity';
import { Sources } from '../src/sites/sources.entity';
import { TimeSeries } from '../src/time-series/time-series.entity';
import AqualinkDataSource from '../ormconfig';

const argv = yargs(process.argv.slice(2))
  .options({
    days: {
      alias: 'd',
      type: 'number',
      describe: 'Number of days to backfill',
      default: 90,
    },
    siteIds: {
      alias: 's',
      type: 'array',
      describe: 'Site IDs to backfill',
      default: [] as number[],
    },
    skipDailyData: {
      alias: 'skip',
      type: 'boolean',
      describe: 'Skip backfilling daily_data and only run updateSST',
      default: false,
    },
  })
  .parseSync();

const DEFAULT_SITE_IDS = [
  9017, 9005, 9016, 9015, 9010, 9011, 9012, 9013, 9007, 9008, 9009, 9006, 9001,
  8996, 9000, 8999, 8998, 8997, 9018, 9014, 9004,
];

async function main() {
  const dataSource = await AqualinkDataSource.initialize();

  const siteIds =
    argv.siteIds.length > 0 ? (argv.siteIds as number[]) : DEFAULT_SITE_IDS;

  console.log(
    `Starting SST backfill for ${siteIds.length} site(s) over ${argv.days} days...`,
  );

  if (!argv.skipDailyData) {
    // Step 1: Backfill daily_data (feeds graphs and heat stress)
    console.log('Backfilling daily_data...');
    await Bluebird.mapSeries(siteIds, async (siteId) => {
      console.log(`Backfilling daily_data for site ${siteId}...`);
      await backfillSiteData({ dataSource, siteId, days: argv.days });
      console.log(`Finished daily_data for site ${siteId}.`);
    });
  } else {
    console.log('Skipping daily_data backfill...');
  }

  // Step 2: Backfill time_series (feeds CSV download)
  console.log('Backfilling time_series...');
  await updateSST(siteIds, argv.days, {
    siteRepository: dataSource.getRepository(Site),
    sourceRepository: dataSource.getRepository(Sources),
    timeSeriesRepository: dataSource.getRepository(TimeSeries),
  });

  console.log('SST backfill complete.');
  dataSource.destroy();
  process.exit(0);
}

main();
