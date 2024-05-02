import { DataSourceOptions, DataSource } from 'typeorm';
import yargs from 'yargs';
import { configService } from '../src/config/config.service';
import { ExclusionDates } from '../src/sites/exclusion-dates.entity';
import { Site } from '../src/sites/sites.entity';
import { Sources } from '../src/sites/sources.entity';
import { TimeSeries } from '../src/time-series/time-series.entity';
import { addSpotterData } from '../src/utils/spotter-time-series';
import { updateSST } from '../src/utils/sst-time-series';

// All implemented task types.
enum TaskType {
  SpotterBackfill = 'spotter_backfill',
  SSTBackfill = 'sst_backfill',
}

// Create string with all TaskType values separated by comma to be used on the command definition.
const tasks = Object.values(TaskType).join(', ');

// Initialize command definition
const { argv } = yargs
  .scriptName('backfill-sofar-time-series')
  .usage('$0 <cmd> [args]')
  .option('t', {
    alias: 'task',
    describe: `The task to run [${tasks}]`,
    demandOption: true,
    type: 'string',
  })
  .option('d', {
    alias: 'days',
    describe: 'Specify how far back we should backfill',
    demandOption: true,
    type: 'number',
  })
  .option('s', {
    alias: 'sites',
    describe: 'The sites that should be backfilled with spotter data',
    type: 'array',
  })
  .option('nc', {
    alias: 'no-check',
    describe: 'Skip distance check for spotter data',
    type: 'boolean',
    default: false,
  })
  .check((args) => {
    // Check if 't' argument's value exists in TaskType
    if (!Object.values(TaskType).includes(args.t as any)) {
      throw new Error(`Task must be one of the following: [${tasks}]`);
    }

    return true;
  })
  // Extend definition to use the full-width of the terminal
  .wrap(yargs.terminalWidth());

/**
 * Return selected task fn.
 * If no task matches throw error.
 * @param task The selected task to run
 * @returns The selected task fn
 */
function getTaskFn(task: string) {
  switch (task) {
    case TaskType.SSTBackfill:
      return updateSST;
    case TaskType.SpotterBackfill:
      return addSpotterData;
    default:
      throw new Error(`Task ${task} does not exist`);
  }
}

async function run() {
  // Extract command line arguments
  const { d: days, s: siteIds, t: task, nc: check } = argv as any;

  // Cast siteIds into a number array. If none are given return empty array
  const parsedSiteIds = siteIds ? siteIds.map(Number) : [];

  // Initialize typeorm connection
  const config = configService.getTypeOrmConfig() as DataSourceOptions;
  const dataSource = new DataSource(config);
  const connection = await dataSource.initialize();

  // Fetch selected task fn
  const fn = getTaskFn(task);

  // Run selected task
  return fn(
    parsedSiteIds,
    days,
    // Fetch all needed repositories
    {
      siteRepository: connection.getRepository(Site),
      sourceRepository: connection.getRepository(Sources),
      timeSeriesRepository: connection.getRepository(TimeSeries),
      exclusionDatesRepository: connection.getRepository(ExclusionDates),
    },
    check,
  );
}

run();
