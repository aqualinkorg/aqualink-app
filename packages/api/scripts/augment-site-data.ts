import { isNil, omitBy } from 'lodash';
import Bluebird from 'bluebird';
import { DataSource, Repository } from 'typeorm';
import { Point } from 'geojson';
import geoTz from 'geo-tz';
import { Site } from '../src/sites/sites.entity';
import { HistoricalMonthlyMean } from '../src/sites/historical-monthly-mean.entity';
import { Region } from '../src/regions/regions.entity';
import { getMMM, getHistoricalMonthlyMeans } from '../src/utils/temperature';
import { getRegion } from '../src/utils/site.utils';
import AqualinkDataSource from '../ormconfig';

async function getAugmentedData(
  site: Site,
  regionRepository: Repository<Region>,
) {
  const [longitude, latitude] = (site.polygon as Point).coordinates;

  const region =
    site.region || (await getRegion(longitude, latitude, regionRepository));

  const MMM = await getMMM(longitude, latitude);
  if (MMM === null) {
    console.warn(
      `Max Monthly Mean appears to be null for Site ${site.name} at (lat, lon): (${latitude}, ${longitude}) `,
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

async function augmentSites(connection: DataSource) {
  const siteRepository = connection.getRepository(Site);
  const regionRepository = connection.getRepository(Region);
  const HistoricalMonthlyMeanRepository = connection.getRepository(
    HistoricalMonthlyMean,
  );
  const allSites = await siteRepository.find();

  const start = new Date();
  console.log(`Augmenting ${allSites.length} sites...`);
  await Bluebird.map(
    allSites,
    async (site) => {
      const augmentedData = await getAugmentedData(site, regionRepository);
      await siteRepository.update(site.id, augmentedData);
      // Add HistoricalMonthlyMeans
      // TODO - use closest noaa longitude and latitude
      const [longitude, latitude] = (site.polygon as Point).coordinates;
      const HistoricalMonthlyMeans = await getHistoricalMonthlyMeans(
        longitude,
        latitude,
      );
      await Promise.all(
        HistoricalMonthlyMeans.map(async ({ month, temperature }) => {
          try {
            await (temperature &&
              HistoricalMonthlyMeanRepository.insert({
                site,
                month,
                temperature,
              }));
          } catch (error) {
            console.warn(
              `Monthly max values not imported for ${site.id} - Error: ${error}`,
            );
          }
        }),
      );
    },
    { concurrency: 1 },
  );
  console.log(
    `Augmented ${allSites.length} sites in ${
      (new Date().valueOf() - start.valueOf()) / 1000
    } seconds`,
  );
}

async function run() {
  const connection = await AqualinkDataSource.initialize();
  await augmentSites(connection);
}

run();
