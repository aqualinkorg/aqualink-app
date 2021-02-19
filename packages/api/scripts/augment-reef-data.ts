import { isNil, omitBy } from 'lodash';
import Bluebird from 'bluebird';
import { Connection, createConnection, Repository } from 'typeorm';
import { Point, GeoJSON } from 'geojson';
import geoTz from 'geo-tz';
import { Reef } from '../src/reefs/reefs.entity';
import { Region } from '../src/regions/regions.entity';
import { getMMM } from '../src/utils/temperature';
import { getGoogleRegion } from '../src/utils/reef.utils';

const dbConfig = require('../ormconfig');

async function getRegion(
  longitude: number,
  latitude: number,
  regionRepository: Repository<Region>,
) {
  const googleRegion = await getGoogleRegion(longitude, latitude);
  const regions = await regionRepository.find({
    where: { name: googleRegion },
  });

  if (regions.length > 0) {
    return regions[0];
  }
  return googleRegion
    ? regionRepository.save({
        name: googleRegion,
        polygon: {
          coordinates: [longitude, latitude],
          type: 'Point',
        } as GeoJSON,
      })
    : undefined;
}

async function getAugmentedData(
  reef: Reef,
  regionRepository: Repository<Region>,
) {
  const [longitude, latitude] = (reef.polygon as Point).coordinates;

  const region =
    reef.region || (await getRegion(longitude, latitude, regionRepository));

  const MMM = await getMMM(longitude, latitude);
  if (MMM === null) {
    console.warn(
      `Max Monthly Mean appears to be null for Reef ${reef.name} at (lat, lon): (${latitude}, ${longitude}) `,
    );
  }

  const timezones = geoTz(latitude, longitude);

  return omitBy(
    {
      region,
      timezone: timezones.length > 0 ? timezones[0] : null,
      maxMonthlyMean: MMM,
    },
    isNil,
  );
}

async function augmentReefs(connection: Connection) {
  const reefRepository = connection.getRepository(Reef);
  const regionRepository = connection.getRepository(Region);
  const allReefs = await reefRepository.find();

  const start = new Date();
  console.log(`Augmenting ${allReefs.length} reefs...`);
  await Bluebird.map(
    allReefs,
    async (reef) => {
      const augmentedData = await getAugmentedData(reef, regionRepository);
      await reefRepository.update(reef.id, augmentedData);
    },
    { concurrency: 1 },
  );
  console.log(
    `Augmented ${allReefs.length} reefs in ${
      (new Date().valueOf() - start.valueOf()) / 1000
    } seconds`,
  );

  // TODO - Add MonthlyMax data for every reef.
}

async function run() {
  createConnection(dbConfig).then(async (connection) => {
    await augmentReefs(connection);
  });
}

run();
