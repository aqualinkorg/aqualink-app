// eslint-disable-next-line import/no-extraneous-dependencies
import yargs from 'yargs';
import { DataSource, DataSourceOptions } from 'typeorm';
import { last } from 'lodash';
import { Logger } from '@nestjs/common';
import { configService } from '../src/config/config.service';
import { Site } from '../src/sites/sites.entity';
import { SiteSurveyPoint } from '../src/site-survey-points/site-survey-points.entity';
import { TimeSeries } from '../src/time-series/time-series.entity';
import { Sources } from '../src/sites/sources.entity';
import { uploadTimeSeriesData } from '../src/utils/uploads/upload-sheet-data';
import { DataUploads } from '../src/data-uploads/data-uploads.entity';
import { SourceType } from '../src/sites/schemas/source-type.enum';

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
    demandOption: false,
  })
  // Extend definition to use the full-width of the terminal
  .wrap(yargs.terminalWidth());

async function run() {
  // Initialize Nest logger
  const logger = new Logger('ParseSondeData');
  // Extract command line arguments
  const { f: filePath, s: siteId, p: surveyPointId, t: sourceType } = argv;

  logger.log(
    `Script params: filePath: ${filePath}, siteId/surveyPointId: ${siteId}/${surveyPointId}, sourceType: ${sourceType}`,
  );

  // Initialize typeorm connection
  const config = configService.getTypeOrmConfig() as DataSourceOptions;
  const dataSource = new DataSource(config);
  const connection = await dataSource.initialize();

  logger.log('Uploading sonde data');
  await uploadTimeSeriesData({
    multiSiteUpload: false,
    filePath,
    fileName: last(filePath.split('/')) || '',
    siteId: parseInt(siteId, 10),
    surveyPointId: surveyPointId ? parseInt(surveyPointId, 10) : undefined,
    sourceType: (sourceType || SourceType.SHEET_DATA) as SourceType,
    repositories: {
      siteRepository: connection.getRepository(Site),
      surveyPointRepository: connection.getRepository(SiteSurveyPoint),
      timeSeriesRepository: connection.getRepository(TimeSeries),
      sourcesRepository: connection.getRepository(Sources),
      dataUploadsRepository: connection.getRepository(DataUploads),
    },
  });

  logger.log('Finished uploading sonde data');
}

run();
