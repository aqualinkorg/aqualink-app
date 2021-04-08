import yargs from 'yargs';
import { ConnectionOptions, createConnection } from 'typeorm';
import { Logger } from '@nestjs/common';
import { configService } from '../src/config/config.service';
import { Reef } from '../src/reefs/reefs.entity';
import { ReefPointOfInterest } from '../src/reef-pois/reef-pois.entity';
import { TimeSeries } from '../src/time-series/time-series.entity';
import { User } from '../src/users/users.entity';
import { Survey } from '../src/surveys/surveys.entity';
import { SurveyMedia } from '../src/surveys/survey-media.entity';
import { GoogleCloudService } from '../src/google-cloud/google-cloud.service';
import { Sources } from '../src/reefs/sources.entity';
import { uploadHoboData } from '../src/utils/upload-hobo-data';
import { Region } from '../src/regions/regions.entity';
import { HistoricalMonthlyMean } from '../src/reefs/historical-monthly-mean.entity';

const { argv } = yargs
  .scriptName('upload-hobo-data')
  .usage('$0 <cmd> [args]')
  .example(
    '$0 -p data/Aqualink -u example@aqualink.com',
    "This command will import the data contained in 'data/Aqualink' directory and use the user with email 'ex@aqualink.com' for any user relations needed (reef-administrator, survey etc)",
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
  .wrap(yargs.terminalWidth());

async function run() {
  const logger = new Logger('ParseHoboData');
  const { p: rootPath, u: userEmail } = argv;

  logger.log(`Script params: rootPath: ${rootPath}, userEmail: ${userEmail}`);
  const config = configService.getTypeOrmConfig() as ConnectionOptions;
  const connection = await createConnection(config);
  const googleCloudService = new GoogleCloudService(
    connection.getRepository(SurveyMedia),
  );

  logger.log('Uploading hobo data');
  const dbIdtTReefId = await uploadHoboData(
    rootPath,
    userEmail,
    googleCloudService,
    {
      reefRepository: connection.getRepository(Reef),
      poiRepository: connection.getRepository(ReefPointOfInterest),
      timeSeriesRepository: connection.getRepository(TimeSeries),
      userRepository: connection.getRepository(User),
      surveyRepository: connection.getRepository(Survey),
      surveyMediaRepository: connection.getRepository(SurveyMedia),
      sourcesRepository: connection.getRepository(Sources),
      regionRepository: connection.getRepository(Region),
      historicalMonthlyMeanRepository: connection.getRepository(
        HistoricalMonthlyMean,
      ),
    },
  );

  logger.log('Finished uploading hobo data');
  logger.log(dbIdtTReefId);
}

run();
