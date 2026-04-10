/* eslint-disable no-plusplus */
/* eslint-disable fp/no-mutation */
import { Logger } from '@nestjs/common';
import yargs from 'yargs';
import { In, IsNull } from 'typeorm';
import { Site } from '../src/sites/sites.entity';
import AqualinkDataSource from '../ormconfig';
import {
  getWaveMaskFromFile,
  updateSofarWaveLocations,
} from '../src/utils/sofar-wave-availability-utils';

type Argv = {
  s?: number[];
  a: boolean;
};

const { argv } = yargs
  .scriptName('fill-sofar-wave-availability')
  .usage('$0 <cmd> [args]')
  .option('s', {
    alias: 'sites',
    describe:
      'Specify the sites for which nearest Sofar wave location will be filled',
    type: 'array',
  })
  .option('a', {
    alias: 'all',
    describe:
      'Update all specified sites even if they already have nearest_sofar_wave_location',
    type: 'boolean',
    default: false,
  })
  .help();

async function run() {
  const { s: sites, a: all } = argv as Argv;

  const parsedIds = sites && sites.map((site) => Number(site));
  const siteIds =
    parsedIds?.filter((x, i) => {
      if (Number.isNaN(x)) {
        Logger.warn(`Skipping invalid site id: ${(sites as any)[i]}`);
        return false;
      }
      return true;
    }) || [];

  const mask = getWaveMaskFromFile();

  const connection = await AqualinkDataSource.initialize();
  Logger.log('Fetching sites');
  const siteRepository = connection.getRepository(Site);
  const allSites = await siteRepository.find({
    where: {
      ...(!all && { nearestSofarWaveLocation: IsNull() }),
      ...(siteIds.length > 0 && { id: In(siteIds) }),
    },
  });

  await updateSofarWaveLocations(allSites, mask, siteRepository);
}

run();
