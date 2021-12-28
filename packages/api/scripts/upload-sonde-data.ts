// eslint-disable-next-line import/no-extraneous-dependencies
import yargs from 'yargs';
import { ConnectionOptions, createConnection } from 'typeorm';
import { Logger } from '@nestjs/common';
import { configService } from '../src/config/config.service';
import { Site } from '../src/sites/sites.entity';
import { SiteSurveyPoint } from '../src/site-survey-points/site-survey-points.entity';
import { TimeSeries } from '../src/time-series/time-series.entity';
import { Sources } from '../src/sites/sources.entity';
import { uploadSondeData } from '../src/utils/uploads/upload-sonde-data';

// Initialize command definition
const { argv } = yargs
  .scriptName('upload-sonde-data')
  .usage('$0 <cmd> [args]')
  .example(
    '$0 -f data/file.xml -s 1006 -p 3 -t sonde',
    "This command will import the data contained in 'data/file.xml' to the timeseries table for site 1006 on survey point 3.",
  )
  .option('f', {
    alias: 'path',
    describe: 'The path to the sonde file to upload',
    demandOption: true,
    type: 'string',
  })
  .option('s', {
    alias: 'site',
    describe: 'The id for the site',
    type: 'string',
    demandOption: true,
  })
  .option('p', {
    alias: 'survey_point',
    describe: 'The id of the corresponding survey point.',
    type: 'string',
    demandOption: false,
  })
  .option('t', {
    alias: 'sonde_type',
    describe: 'The sonde type indicating how to process the file.',
    type: 'string',
    demandOption: true,
  })
  // Extend definition to use the full-width of the terminal
  .wrap(yargs.terminalWidth());

async function run() {
  // Initialize Nest logger
  const logger = new Logger('ParseSondeData');
  // Extract command line arguments
  const { f: filePath, s: siteId, p: surveyPointId, t: sondeType } = argv;

  logger.log(
    `Script params: filePath: ${filePath}, siteId/surveyPointId: ${siteId}/${surveyPointId}, sondeType: ${sondeType}`,
  );

  // Initialize typeorm connection
  const config = configService.getTypeOrmConfig() as ConnectionOptions;
  const connection = await createConnection(config);

  logger.log('Uploading sonde data');
  await uploadSondeData(
    filePath,
    siteId,
    surveyPointId,
    sondeType,
    // Fetch all needed repositories
    {
      siteRepository: connection.getRepository(Site),
      surveyPointRepository: connection.getRepository(SiteSurveyPoint),
      timeSeriesRepository: connection.getRepository(TimeSeries),
      sourcesRepository: connection.getRepository(Sources),
    },
  );

  logger.log('Finished uploading sonde data');
}

run();
