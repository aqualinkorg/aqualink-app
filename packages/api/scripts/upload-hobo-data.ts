import yargs from 'yargs';
import fs from 'fs';
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
import { uploadHoboData } from '../src/utils/import-hobo-data';
import { Region } from '../src/regions/regions.entity';
import { MonthlyMax } from '../src/reefs/monthly-max.entity';

const { argv } = yargs
  .scriptName('parse-hobo-data')
  .usage('$0 <cmd> [args]')
  .option('p', {
    alias: 'path',
    describe: 'The path to the HOBO data zip',
    demandOption: true,
    type: 'string',
  })
  .option('r', {
    alias: 'reefs',
    describe: 'The reef id',
    type: 'array',
    demandOption: true,
  })
  .option('a', {
    alias: 'alias',
    describe: 'Override the name of the hobo data folder',
    type: 'array',
    demandOption: true,
  })
  .option('u', {
    alias: 'user',
    describe: 'The email of the user to be used for the needed relationships',
    type: 'string',
    demandOption: true,
  });

async function run() {
  const logger = new Logger('ParseHoboData');
  const { p: rootPath, r: reefIds, a: aliases, u: userEmail } = argv;
  const aliasMap: [number, string][] = reefIds.map((reefId, idx) => [
    parseInt(reefId.toString(), 10),
    aliases[idx].toString(),
  ]);

  logger.log(
    `Script params: rootPath: ${rootPath}, aliasMap: ${aliasMap}, userEmail: ${userEmail}`,
  );
  // Create a dummy multer file to be able to get accepted by service
  const file: Express.Multer.File = {
    fieldname: 'file',
    originalname: rootPath,
    buffer: fs.readFileSync(rootPath),
    path: rootPath,
    size: 0,
    encoding: 'utf-8',
    mimetype: 'zip',
    filename: rootPath,
    destination: rootPath,
    stream: fs.createReadStream(rootPath),
  };

  const config = configService.getTypeOrmConfig() as ConnectionOptions;
  const connection = await createConnection(config);
  const googleCloudService = new GoogleCloudService(
    connection.getRepository(SurveyMedia),
  );

  logger.log('Uploading hobo data');
  const dbIdtTReefId = await uploadHoboData(
    file,
    aliasMap,
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
      monthlyMaxRepository: connection.getRepository(MonthlyMax),
    },
  );

  logger.log('Finished uploading hobo data');
  logger.log(dbIdtTReefId);
}

run();
