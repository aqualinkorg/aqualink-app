import { ConnectionOptions, createConnection } from 'typeorm';
import yargs from 'yargs';
import { configService } from '../src/config/config.service';
import { Reef } from '../src/reefs/reefs.entity';
import { Sources } from '../src/reefs/sources.entity';
import { TimeSeries } from '../src/time-series/time-series.entity';
import { addSpotterData } from '../src/utils/spotter-time-series';

const { argv } = yargs
  .scriptName('parse-hobo-data')
  .usage('$0 <cmd> [args]')
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
  });

async function run() {
  const { d: days, r: reefIds } = argv;

  const parsedReefIds = reefIds ? reefIds.map(Number) : [];

  const config = configService.getTypeOrmConfig() as ConnectionOptions;
  const connection = await createConnection(config);
  const reefRepository = connection.getRepository(Reef);
  const sourceRepository = connection.getRepository(Sources);
  const timeSeriesRepository = connection.getRepository(TimeSeries);

  addSpotterData(parsedReefIds, days, connection, {
    reefRepository,
    sourceRepository,
    timeSeriesRepository,
  });
}

run();
