import { DataSource, DataSourceOptions } from 'typeorm';
import yargs from 'yargs';
import { configService } from '../src/config/config.service';
import { Site } from '../src/sites/sites.entity';
import { addWindWaveData } from '../src/utils/hindcast-wind-wave';
import { ForecastData } from '../src/wind-wave-data/forecast-data.entity';

// Initialize command definition
const { argv } = yargs
  .scriptName('update-wind-wave-data')
  .usage('$0 <cmd> [args]')
  .option('s', {
    alias: 'sites',
    describe: 'The sites that should get hindcast wind-wave data',
    type: 'array',
    default: [],
  })
  // Extend definition to use the full-width of the terminal
  .wrap(yargs.terminalWidth());

const run = async () => {
  // Extract command line arguments
  const { s: siteIds } = argv;

  // Cast siteIds into a number array.
  const parsedSiteIds = siteIds.map(Number);

  const config = configService.getTypeOrmConfig() as DataSourceOptions;
  const dataSource = new DataSource(config);
  const connection = await dataSource.initialize();

  return addWindWaveData(parsedSiteIds, {
    siteRepository: connection.getRepository(Site),
    hindcastRepository: connection.getRepository(ForecastData),
  });
};

run();
