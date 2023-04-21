/* eslint-disable fp/no-mutating-methods */
/* eslint-disable no-plusplus */
/* eslint-disable fp/no-mutation */
import axios from 'axios';
import { Logger } from '@nestjs/common';
import fs from 'fs';
import yargs from 'yargs';
import { DataSource, In, IsNull } from 'typeorm';
import Bluebird from 'bluebird';
import { Point } from 'geojson';
import { Site } from '../src/sites/sites.entity';
import { createPoint } from '../src/utils/coordinates';

const dbConfig = require('../ormconfig');

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

function BFS(
  visited: Map<string, boolean>,
  stack: { lon: number; lat: number }[],
  worldMap: number[][],
): [number, number] | null {
  const head = stack.shift();

  if (!head) return null;
  if (visited.has(`${head.lon},${head.lat}`))
    return BFS(visited, stack, worldMap);
  if (Boolean(worldMap[head.lon][head.lat]) === false)
    return [head.lon, head.lat];

  visited.set(`${head.lon},${head.lat}`, true);

  const up = { lon: (head.lon + 1) % 7200, lat: head.lat };
  const down = { lon: (head.lon + 1) % 7200, lat: head.lat };
  const right = { lon: head.lon, lat: (head.lat + 1) % 3200 };
  const left = { lon: head.lon, lat: (head.lat - 1) % 3200 };

  if (!visited.has(`${up.lon},${up.lat}`)) stack.push(up);
  if (!visited.has(`${down.lon},${down.lat}`)) stack.push(down);
  if (!visited.has(`${right.lon},${right.lat}`)) stack.push(right);
  if (!visited.has(`${left.lon},${left.lat}`)) stack.push(left);

  return BFS(visited, stack, worldMap);
}
// Points further than 175km away from a noaa available point will result in a maximum stack exited error.
async function getNearestAvailablePoint(
  longitude: number,
  latitude: number,
  worldMap: number[][],
): Promise<[number, number]> {
  const lonIndex = Math.round((180 + longitude) / 0.05);
  const latIndex = Math.round((90 + latitude) / 0.05);

  const visited = new Map<string, boolean>();
  const stack = [{ lon: lonIndex, lat: latIndex }];
  const result = BFS(visited, stack, worldMap);
  if (result === null) throw new Error('Did not find nearest point!');

  return [
    Number((result[0] * 0.05 - 180).toFixed(3)),
    Number((result[1] * 0.05 - 90).toFixed(3)),
  ];
}

async function run() {
  const { s: sites, a: all } = argv;
  const parsedIds = sites && sites.map((site) => Number(site));
  const siteIds =
    parsedIds?.filter((x, i) => {
      if (Number.isNaN(x)) {
        Logger.warn(`Skipping invalid site id: ${(sites as any)[i]}`);
        return false;
      }
      return true;
    }) || [];
  const availabilityArray = await getAvailabilityMapFromNetCDF4();
  const dataSource = new DataSource(dbConfig);
  const connection = await dataSource.initialize();
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
    async (site) => {
      const { polygon, id } = site;
      const [longitude, latitude] = (polygon as Point).coordinates;
      try {
        const [NOAALongitude, NOAALatitude] = await getNearestAvailablePoint(
          longitude,
          latitude,
          availabilityArray,
        );

        await siteRepository.save({
          id,
          nearestNOAALocation: createPoint(NOAALongitude, NOAALatitude),
        });
        Logger.log(
          `Updated site ${id} (${longitude}, ${latitude}) -> (${NOAALongitude}, ${NOAALatitude}) `,
        );
      } catch (error) {
        console.error(error);
        Logger.warn(
          `Could not get nearest point for site id: ${site.id}, (lon, lat): (${longitude}, ${latitude})`,
        );
      }
    },
    { concurrency: 8 },
  );
}

run();
