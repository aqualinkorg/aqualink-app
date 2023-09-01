/* eslint-disable react/destructuring-assignment */
/* eslint-disable fp/no-mutating-methods */
/* eslint-disable no-plusplus */
/* eslint-disable fp/no-mutation */
import { Logger } from '@nestjs/common';
import fs from 'fs';
import { Point } from 'geojson';
import { Repository } from 'typeorm';
import { join } from 'path';
import { Site } from '../sites/sites.entity';
import { createPoint } from './coordinates';

const AVAILABILITY_FILE = join(__dirname, '../../assets/noaa-availability');

export function createAndSaveCompactFile(worldMap: number[][]) {
  Logger.log('Creating word map binary file...');
  const buffer: number[] = []; // this will have 7200 * 3200 / 8 entries
  const chunkSize = 8; // bytes
  for (let i = 0; i < 7200; i++) {
    for (let j = 0; j < 3600; j += chunkSize) {
      const chunk = worldMap[i].slice(j, j + chunkSize);
      const byte = parseInt(
        chunk
          .map((x) => Boolean(x))
          .map((x) => Number(x))
          .join(''),
        2,
      );
      buffer.push(byte);
    }
  }
  fs.writeFileSync(AVAILABILITY_FILE, Buffer.from(buffer));
}

export function getAvailabilityMapFromFile() {
  Logger.log('Getting world mask from local file...');
  const file = fs.readFileSync(AVAILABILITY_FILE, { flag: 'r' });
  const worldMap: number[][] = [];
  let i = 0;
  let j = 0;

  const bytes = Array.from(file);
  bytes.forEach((byte) => {
    if (j === 0) worldMap[i] = [];
    worldMap[i].push(
      ...Array.from(`00000000${byte.toString(2)}`.slice(-8)).map((x) =>
        Number(x),
      ),
    );
    i += Math.floor((j + 1) / (3600 / 8));
    j = (j + 1) % (3600 / 8);
  });

  return worldMap;
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

export async function updateNOAALocation(
  site: Site,
  worldMap: number[][],
  siteRepository: Repository<Site>,
) {
  const { polygon, id } = site;
  const [longitude, latitude] = (polygon as Point).coordinates;
  try {
    const [NOAALongitude, NOAALatitude] = await getNearestAvailablePoint(
      longitude,
      latitude,
      worldMap,
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
}
