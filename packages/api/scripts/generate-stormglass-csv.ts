/* eslint-disable no-plusplus, fp/no-mutation */
import { createConnection } from 'typeorm';
import { Point } from 'geojson';
import fs from 'fs';
import { Site } from '../src/sites/sites.entity';
import { getSofarNearestAvailablePoint } from '../src/utils/sofar-availability';
import { getForecastData } from '../src/utils/hindcast-wind-wave';
import { stormGlassGetWeather } from '../src/utils/storm-glass';
import {
  StormGlassParamsType,
  StormGlassSourceType,
} from '../src/utils/storm-glass.types';

const dbConfig = require('../ormconfig');

const stormGlassParams: StormGlassParamsType[] = [
  'waveHeight',
  'currentDirection',
  'currentSpeed',
  'gust',
  'waveDirection',
  'waveHeight',
  'wavePeriod',
  'windWaveDirection',
  'windWaveHeight',
  'windWavePeriod',
  'windSpeed',
];

async function getSitesInfo() {
  const conn = await createConnection(dbConfig);

  const sites = await conn
    .getRepository(Site)
    .createQueryBuilder('site')
    .getMany();

  conn.close();

  return sites;
}

const earthRadius = 6371e3;
const thetaFactor = Math.PI / 180.0;

function getDistanceInDegrees(a1: number, a2: number, b1: number, b2: number) {
  const x1 = Math.sin(a2 * thetaFactor) * Math.cos(a1 * thetaFactor);
  const y1 = Math.sin(a2 * thetaFactor) * Math.sin(a1 * thetaFactor);
  const z1 = Math.cos(a2 * thetaFactor);

  const x2 = Math.sin(b2 * thetaFactor) * Math.cos(b1 * thetaFactor);
  const y2 = Math.sin(b2 * thetaFactor) * Math.sin(b1 * thetaFactor);
  const z2 = Math.cos(b2 * thetaFactor);

  const modV1 = Math.sqrt(x1 * x1 + y1 * y1 + z1 * z1);

  const modV2 = Math.sqrt(x2 * x2 + y2 * y2 + z2 * z2);

  const dotProductV1V2 = x1 * x2 + y1 * y2 + z1 * z2;

  const alphaRad = Math.acos(dotProductV1V2 / (modV1 * modV2));

  const alphaDeg = (alphaRad * 180.0) / Math.PI;
  return alphaDeg;
}

function getDistanceInMeters(a1: number, a2: number, b1: number, b2: number) {
  const phi1 = a1 * thetaFactor;
  const phi2 = b1 * thetaFactor;
  const deltaPhi = (b1 - a1) * thetaFactor;
  const deltaLambda = (b2 - a2) * thetaFactor;

  const alpha =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) *
      Math.cos(phi2) *
      Math.sin(deltaLambda / 2) *
      Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(alpha), Math.sqrt(1 - alpha));

  const d = earthRadius * c;
  return d;
}

const main = async () => {
  const sites = await getSitesInfo();

  const total = sites.length;
  let sofarCompleted = 0;
  let stormglassCompleted = 0;

  const loading = (() => {
    const P = ['\\', '|', '/', '-'];
    let i = 0;
    return setInterval(() => {
      process.stdout.write(
        `\r${
          P[i++]
        } sofar requests: ${sofarCompleted}/${total}, stormglass requests: ${stormglassCompleted}/${total} `,
      );
      // eslint-disable-next-line fp/no-mutation
      i %= P.length;
    }, 250);
  })();

  const headRow = [
    'site_name',
    'site_region',
    'aqualink_site_link',
    'point_deviation_in_degrees',
    'point_deviation_in_meters',
    'sofar_time',
    'sofar_significantWaveHeight',
    'sofar_waveMeanDirection',
    'sofar_waveMeanPeriod',
    'sofar_windSpeed',
    'sofar_windDirection',
    'stormglass_time',
    'stormglass_currentDirection',
    'currentDirection_source',
    'stormglass_currentSpeed',
    'currentSpeed_source',
    'stormglass_gust',
    'gust_source',
    'stormglass_time',
    'time_source',
    'stormglass_waveDirection',
    'waveDirection_source',
    'stormglass_waveHeight',
    'waveHeight_source',
    'stormglass_wavePeriod',
    'wavePeriod_source',
    'stormglass_windSpeed',
    'windSpeed_source',
    'stormglass_windWaveDirection',
    'windWaveDirection_source',
    'stormglass_windWaveHeight',
    'windWaveHeight_source',
    'stormglass_windWavePeriod',
    'windWavePeriod_source',
  ].join(';');

  const fd = fs.openSync('stormglass.csv', 'w');

  fs.writeFileSync(fd, `${headRow}\n`);

  await Promise.all(
    sites.map(async (site) => {
      const { polygon } = site;
      const [longitude, latitude] = (polygon as Point).coordinates;

      const [sofarLongitude, sofarLatitude] = getSofarNearestAvailablePoint(
        polygon as Point,
      );

      const deviationInDegrees = getDistanceInDegrees(
        latitude,
        longitude,
        sofarLatitude,
        sofarLongitude,
      );
      const deviationInMeters = getDistanceInMeters(
        latitude,
        longitude,
        sofarLatitude,
        sofarLongitude,
      );

      const sofarData = await getForecastData(sofarLatitude, sofarLongitude);
      // eslint-disable-next-line fp/no-mutation
      sofarCompleted += 1;
      const sofarTime = sofarData.significantWaveHeight?.timestamp as string;
      const sofarProcessedData = Object.entries(sofarData).map(
        ([metric, value]) => {
          return { metric, value };
        },
      );
      // eslint-disable-next-line fp/no-mutating-methods
      const sofarSortedProcessedData = sofarProcessedData.sort((x, y) => {
        if (x > y) return 1;
        if (x < y) return -1;
        return 0;
      });

      const nowISO = new Date().toISOString();

      const sg = (await stormGlassGetWeather({
        latitude,
        longitude,
        params: stormGlassParams,
        source: undefined,
        start: nowISO,
        end: nowISO,
        raw: true,
      })) as any;
      // eslint-disable-next-line fp/no-mutation
      stormglassCompleted += 1;

      const { stormglassTime, ...sgData } = sg.hours[0];
      const stormGlassProcessedData = Object.entries(sgData).map(
        ([metric, s]) => {
          const sgSources = Object.entries(s as any).map(([source, value]) => {
            return { source, value };
          });
          const sgAI = sgSources.find(
            (x) => (x.source as unknown as StormGlassSourceType) === 'sg',
          );
          const selectedSource = sgSources.find((x) => x.value === sgAI?.value);
          return {
            metric,
            selectedSource: selectedSource?.source,
            value: sgAI?.value,
          };
        },
      );

      // eslint-disable-next-line fp/no-mutating-methods
      const stormglassSortedProcessedData = stormGlassProcessedData.sort(
        (x, y) => {
          if (x > y) return 1;
          if (x < y) return -1;
          return 0;
        },
      );

      const row = `${site.name};${site.region};https://aqualink.org/sites/${
        site.id
      };${deviationInDegrees};${deviationInMeters};${sofarTime};${sofarSortedProcessedData
        .map((x) => x.value?.value)
        .join(';')};${stormglassTime};${stormglassSortedProcessedData
        .map((x) => `${x.value};${x.selectedSource}`)
        .join(';')}`;

      fs.writeFileSync(fd, `${row}\n`);
    }),
  );

  clearInterval(loading);
};

main();
