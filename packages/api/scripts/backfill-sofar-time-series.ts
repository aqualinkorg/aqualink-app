import { ConnectionOptions, createConnection } from 'typeorm';
import yargs from 'yargs';
import { configService } from '../src/config/config.service';
import { Reef } from '../src/reefs/reefs.entity';
import { Sources } from '../src/reefs/sources.entity';
import { TimeSeries } from '../src/time-series/time-series.entity';
import { addSpotterData } from '../src/utils/spotter-time-series';
import { updateSST } from '../src/utils/sst-time-series';

enum TaskType {
  SpotterBackfill = 'spotter_backfill',
  SSTBackfill = 'sst_backfill',
}

const tasks = Object.values(TaskType).join(', ');

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
  .option('r', {
    alias: 'reefs',
    describe: 'The reefs that should be backfilled with spotter data',
    type: 'array',
  })
  .check((args) => {
    if (!Object.values(TaskType).includes(args.t as TaskType)) {
      throw new Error(`Task must be one of the following: [${tasks}]`);
    }

    return true;
  })
  .wrap(yargs.terminalWidth());

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
  const { d: days, r: reefIds, t: task } = argv;

  const parsedReefIds = reefIds ? reefIds.map(Number) : [];

  const config = configService.getTypeOrmConfig() as ConnectionOptions;
  const connection = await createConnection(config);
  const reefRepository = connection.getRepository(Reef);
  const sourceRepository = connection.getRepository(Sources);
  const timeSeriesRepository = connection.getRepository(TimeSeries);

  const fn = getTaskFn(task);

  return fn(parsedReefIds, days, connection, {
    reefRepository,
    sourceRepository,
    timeSeriesRepository,
  });
}

run();
