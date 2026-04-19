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
      describe: 'Site IDs to backfill (required)',
    },
    skipDailyData: {
      alias: 'skip',
      type: 'boolean',
      describe: 'Skip backfilling daily_data and only run updateSST',
      default: false,
    },
  })
  .parseSync();

async function main() {
  const dataSource = await AqualinkDataSource.initialize();

  const siteIds =
    argv.siteIds && argv.siteIds.length > 0
      ? (argv.siteIds as (string | number)[]).map((id) => Number(id))
      : [];

  if (siteIds.length === 0) {
    console.error(
      'No site IDs provided. Please specify at least one site ID using --siteIds or -s.',
    );
    await dataSource.destroy();
    // eslint-disable-next-line fp/no-mutation
    process.exitCode = 1;
    return;
  }

  console.log(
    `Starting SST backfill for ${siteIds.length} site(s) over ${argv.days} days...`,
  );

  if (!argv.skipDailyData) {
    console.log('Backfilling daily_data...');
    await Bluebird.mapSeries(siteIds, async (siteId) => {
      console.log(`Backfilling daily_data for site ${siteId}...`);
      await backfillSiteData({ dataSource, siteId, days: argv.days });
      console.log(`Finished daily_data for site ${siteId}.`);
    });
  } else {
    console.log('Skipping daily_data backfill...');
  }

  console.log('Backfilling time_series...');
  await updateSST(siteIds, argv.days, {
    siteRepository: dataSource.getRepository(Site),
    sourceRepository: dataSource.getRepository(Sources),
    timeSeriesRepository: dataSource.getRepository(TimeSeries),
  });

  console.log('SST backfill complete.');
  await dataSource.destroy();
}

main().catch((error) => {
  console.error(error);
  // eslint-disable-next-line fp/no-mutation
  process.exitCode = 1;
});
