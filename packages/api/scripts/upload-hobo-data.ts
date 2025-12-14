import yargs from 'yargs';
import { DataSourceOptions, DataSource } from 'typeorm';
import { Logger } from '@nestjs/common';
import { configService } from '../src/config/config.service';
import { Site } from '../src/sites/sites.entity';
import { SiteSurveyPoint } from '../src/site-survey-points/site-survey-points.entity';
import { TimeSeries } from '../src/time-series/time-series.entity';
import { User } from '../src/users/users.entity';
import { Survey } from '../src/surveys/surveys.entity';
import { SurveyMedia } from '../src/surveys/survey-media.entity';
import { GoogleCloudService } from '../src/google-cloud/google-cloud.service';
import { Sources } from '../src/sites/sources.entity';
import { uploadHoboData } from '../src/utils/uploads/upload-hobo-data';
import { Region } from '../src/regions/regions.entity';
import { HistoricalMonthlyMean } from '../src/sites/historical-monthly-mean.entity';
import { DataUploads } from '../src/data-uploads/data-uploads.entity';

// Initialize command definition
const { argv } = yargs
  .scriptName('upload-hobo-data')
  .usage('$0 <cmd> [args]')
  .example(
    '$0 -p data/Aqualink -u example@aqualink.com',
    "This command will import the data contained in 'data/Aqualink' directory and use the user with email 'ex@aqualink.com' for any user relations needed (site-administrator, survey etc)",
  )
  .option('p', {
    alias: 'path',
    describe: 'The path to the HOBO data folder',
    demandOption: true,
    type: 'string',
  })
  .option('u', {
    alias: 'user',
    describe: 'The email of the user to be used for the needed relationships',
    type: 'string',
    demandOption: true,
  })
  // Extend definition to use the full-width of the terminal
  .wrap(yargs.terminalWidth());

async function run() {
  // Initialize Nest logger
  const logger = new Logger('ParseHoboData');
  // Extract command line arguments
  const { p: rootPath, u: userEmail } = argv;

  logger.log(`Script params: rootPath: ${rootPath}, userEmail: ${userEmail}`);

  // Initialize typeorm connection
  const config = configService.getTypeOrmConfig() as DataSourceOptions;
  const dataSource = new DataSource(config);
  const connection = await dataSource.initialize();

  // Initialize google cloud service, to be used for media upload
  const googleCloudService = new GoogleCloudService(
    connection.getRepository(SurveyMedia),
    connection.getRepository(DataUploads),
  );

  logger.log('Uploading hobo data');
  const dbIdtTSiteId = await uploadHoboData(
    rootPath,
    userEmail,
    googleCloudService,
    // Fetch all needed repositories
    {
      siteRepository: connection.getRepository(Site),
      surveyPointRepository: connection.getRepository(SiteSurveyPoint),
      timeSeriesRepository: connection.getRepository(TimeSeries),
      userRepository: connection.getRepository(User),
      surveyRepository: connection.getRepository(Survey),
      surveyMediaRepository: connection.getRepository(SurveyMedia),
      sourcesRepository: connection.getRepository(Sources),
      regionRepository: connection.getRepository(Region),
      historicalMonthlyMeanRepository: connection.getRepository(
        HistoricalMonthlyMean,
      ),
      dataUploadsRepository: connection.getRepository(DataUploads),
    },
    dataSource,
  );

  logger.log('Finished uploading hobo data');
  logger.log(dbIdtTSiteId);
}

run();
