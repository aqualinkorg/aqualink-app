/* eslint-disable no-plusplus */
/* eslint-disable fp/no-mutation */
import axios from 'axios';
import { Logger } from '@nestjs/common';
import fs from 'fs';
import yargs from 'yargs';
import { In, IsNull } from 'typeorm';
import Bluebird from 'bluebird';
import { Site } from '../src/sites/sites.entity';
import AqualinkDataSource from '../ormconfig';
import {
  createAndSaveCompactFile,
  getAvailabilityMapFromFile,
  updateNOAALocation,
} from '../src/utils/noaa-availability-utils';

let netcdf4;
try {
  // eslint-disable-next-line global-require, fp/no-mutation, import/no-unresolved
  netcdf4 = require('netcdf4');
} catch {
  Logger.error(
    'NetCDF is not installed. Please install NetCDF before continuing.',
  );
  process.exit();
}

// List of some available files https://www.star.nesdis.noaa.gov/pub/sod/mecb/crw/data/5km/v3.1_op/nc/v1.0/daily/sst/2022/
const FILE_URL =
  'https://www.star.nesdis.noaa.gov/pub/sod/mecb/crw/data/5km/v3.1_op/nc/v1.0/daily/sst/2022/coraltemp_v3.1_20221024.nc';

const { argv } = yargs
  .scriptName('fill-noaa-availability')
  .usage('$0 <cmd> [args]')
  .option('s', {
    alias: 'sites',
    describe:
      'Specify the sites for which nearest noaa availability point will be filled',
    type: 'array',
  })
  .option('a', {
    alias: 'all',
    describe:
      'Update all specified sites even if they already have nearest_noaa_location',
    type: 'boolean',
    default: false,
  })
  .option('u', {
    alias: 'update',
    describe: 'Update noaa-availability asset file',
    type: 'boolean',
    default: false,
  })
  .help();

async function getAvailabilityMapFromNetCDF4() {
  Logger.log('Fetching NetCDF4 file...');

  const tempFileName = './noaa_data.nc';

  const response = await axios.get(FILE_URL, {
    responseType: 'arraybuffer',
  });
  const buff = Buffer.from(response.data);
  fs.writeFileSync(tempFileName, buff);

  const netcdfData = new netcdf4.File(tempFileName, 'r');

  Logger.log('Creating world mask...');

  // world[lon][lat]: world[7200][3600]. true means a value is invalid.
  const world: number[][] = [];
  const { fillvalue } = netcdfData.root.variables.analysed_sst;

  for (let i = 0; i < 7200; i++) {
    const row = netcdfData.root.variables.analysed_sst
      .readSlice(0, 1, 0, 3600, i, 1)
      .map((x: number) => x === fillvalue);
    world[i] = row;
  }

  Logger.log(`Deleting temp file: ${tempFileName}`);
  fs.unlink(tempFileName, (err) => {
    if (err) console.error(err);
  });

  return world;
}

async function run() {
  const { s: sites, a: all, u: update } = argv;
  const parsedIds = sites && sites.map((site) => Number(site));
  const siteIds =
    parsedIds?.filter((x, i) => {
      if (Number.isNaN(x)) {
        Logger.warn(`Skipping invalid site id: ${(sites as any)[i]}`);
        return false;
      }
      return true;
    }) || [];

  const availabilityArray = update
    ? await getAvailabilityMapFromNetCDF4()
    : getAvailabilityMapFromFile();

  if (update) createAndSaveCompactFile(availabilityArray);

  const connection = await AqualinkDataSource.initialize();
  Logger.log('Fetching sites');
  const siteRepository = connection.getRepository(Site);
  const allSites = await siteRepository.find({
    where: {
      ...(!all && { nearestNOAALocation: IsNull() }),
      ...(siteIds.length > 0 && { id: In(siteIds) }),
    },
  });

  await Bluebird.map(
    allSites,
    (site) => updateNOAALocation(site, availabilityArray, siteRepository),
    { concurrency: 8 },
  );
}

run();
