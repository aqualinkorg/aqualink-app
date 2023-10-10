/* eslint-disable no-plusplus, fp/no-mutation */
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
import AqualinkDataSource from '../ormconfig';

interface SGSources {
  sg?: number;
  icon?: number;
  dwd?: number;
  noaa?: number;
  meteo?: number;
  meto?: number;
  fcoo?: number;
  fmi?: number;
  yr?: number;
  smhi?: number;
  sgSource?: StormGlassSourceType;
}

interface MySGData {
  waveHeight?: SGSources;
  waveDirection?: SGSources;
  wavePeriod?: SGSources;
  windSpeed?: SGSources;
  windDirection?: SGSources;
}

const stormGlassParams: StormGlassParamsType[] = [
  'waveHeight',
  'waveDirection',
  'wavePeriod',
  'windSpeed',
  'windDirection',
];

async function getSitesInfo() {
  const conn = await AqualinkDataSource.initialize();

  const sites = await conn
    .getRepository(Site)
    .createQueryBuilder('site')
    .leftJoinAndSelect('site.region', 'region')
    .getMany();

  conn.destroy();

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
  let sofarStart;
  let sofarEnd;
  let stormglassStart;
  let stormglassEnd;

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
      if (sofarCompleted > 0 && !sofarStart) sofarStart = new Date().getTime();
      if (stormglassCompleted > 0 && !stormglassStart)
        stormglassStart = new Date().getTime();
    }, 250);
  })();

  const headRow = [
    'site_name',
    'site_region',
    'aqualink_site_link',
    'in_sofar_wave_model_zone',
    'point_deviation_in_degrees',
    'point_deviation_in_meters',
    'sofar_time',
    'stormglass_time',

    'sofar_significantWaveHeight',
    'icon_waveHeight',
    'dwd_waveHeight',
    'noaa_waveHeight',
    'meteo_waveHeight',
    'meto_waveHeight',
    'fcoo_waveHeight',
    'fmi_waveHeight',
    'yr_waveHeight',
    'smhi_waveHeight',
    'sg_waveHeight',
    'sg_waveHeight_source',

    'sofar_waveMeanDirection',
    'icon_waveDirection',
    'dwd_waveDirection',
    'noaa_waveDirection',
    'meteo_waveDirection',
    'meto_waveDirection',
    'fcoo_waveDirection',
    'fmi_waveDirection',
    'yr_waveDirection',
    'smhi_waveDirection',
    'sg_waveDirection',
    'sg_waveDirection_source',

    'sofar_waveMeanPeriod',
    'icon_wavePeriod',
    'dwd_wavePeriod',
    'noaa_wavePeriod',
    'meteo_wavePeriod',
    'meto_wavePeriod',
    'fcoo_wavePeriod',
    'fmi_wavePeriod',
    'yr_wavePeriod',
    'smhi_wavePeriod',
    'sg_wavePeriod',
    'sg_wavePeriod_source',

    'sofar_windSpeed',
    'icon_windSpeed',
    'dwd_windSpeed',
    'noaa_windSpeed',
    'meteo_windSpeed',
    'meto_windSpeed',
    'fcoo_windSpeed',
    'fmi_windSpeed',
    'yr_windSpeed',
    'smhi_windSpeed',
    'sg_windSpeed',
    'sg_windSpeed_source',

    'sofar_windDirection',
    'icon_windDirection',
    'dwd_windDirection',
    'noaa_windDirection',
    'meteo_windDirection',
    'meto_windDirection',
    'fcoo_windDirection',
    'fmi_windDirection',
    'yr_windDirection',
    'smhi_windDirection',
    'sg_windDirection',
    'sg_windDirection_source',
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

      const originalCordsResponse = await getForecastData(latitude, longitude);
      const inSofarWaveModelZone = Object.entries(originalCordsResponse).some(
        (x) => x[1] !== undefined,
      );
      const sofarData = inSofarWaveModelZone
        ? originalCordsResponse
        : await getForecastData(sofarLatitude, sofarLongitude);
      sofarCompleted += 1;
      if (sofarCompleted === total) sofarEnd = new Date().getTime();

      const sofarTime = sofarData.significantWaveHeight?.timestamp as string;

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
      stormglassCompleted += 1;
      if (stormglassCompleted === total) stormglassEnd = new Date().getTime();

      const { time: stormglassTime, ...sgData } = sg.hours[0];

      const stormglassData = Object.entries(sgData).reduce(
        (acc, [metric, s]) => {
          const ss = Object.entries(s as any).map(([source, value]) => {
            return { source, value };
          });
          const sgAI = ss.find(
            (x) => (x.source as unknown as StormGlassSourceType) === 'sg',
          );
          const selectedSource = ss.find((x) => x.value === sgAI?.value);
          const sgSources: SGSources = {
            sgSource: selectedSource?.source,
            ...(s as any),
          };
          return {
            ...acc,
            [metric]: sgSources,
          };
        },
        {},
      ) as MySGData;

      const row = [
        `${site.name}`,
        `${site.region?.name}`,
        `https://aqualink.org/sites/${site.id}`,
        `${inSofarWaveModelZone}`,
        `${Math.round(deviationInDegrees * 100) / 100}°`,
        `${Math.round(deviationInMeters / 10) / 100} Km`,
        `${sofarTime}`,
        `${stormglassTime}`,

        `${sofarData.significantWaveHeight?.value}`,
        `${stormglassData?.waveHeight?.icon}`,
        `${stormglassData?.waveHeight?.dwd}`,
        `${stormglassData?.waveHeight?.noaa}`,
        `${stormglassData?.waveHeight?.meteo}`,
        `${stormglassData?.waveHeight?.meto}`,
        `${stormglassData?.waveHeight?.fcoo}`,
        `${stormglassData?.waveHeight?.fmi}`,
        `${stormglassData?.waveHeight?.yr}`,
        `${stormglassData?.waveHeight?.smhi}`,
        `${stormglassData?.waveHeight?.sg}`,
        `${stormglassData?.waveHeight?.sgSource}`,

        `${sofarData.waveMeanDirection?.value}`,
        `${stormglassData?.waveDirection?.icon}`,
        `${stormglassData?.waveDirection?.dwd}`,
        `${stormglassData?.waveDirection?.noaa}`,
        `${stormglassData?.waveDirection?.meteo}`,
        `${stormglassData?.waveDirection?.meto}`,
        `${stormglassData?.waveDirection?.fcoo}`,
        `${stormglassData?.waveDirection?.fmi}`,
        `${stormglassData?.waveDirection?.yr}`,
        `${stormglassData?.waveDirection?.smhi}`,
        `${stormglassData?.waveDirection?.sg}`,
        `${stormglassData?.waveDirection?.sgSource}`,

        `${sofarData.waveMeanPeriod?.value}`,
        `${stormglassData?.wavePeriod?.icon}`,
        `${stormglassData?.wavePeriod?.dwd}`,
        `${stormglassData?.wavePeriod?.noaa}`,
        `${stormglassData?.wavePeriod?.meteo}`,
        `${stormglassData?.wavePeriod?.meto}`,
        `${stormglassData?.wavePeriod?.fcoo}`,
        `${stormglassData?.wavePeriod?.fmi}`,
        `${stormglassData?.wavePeriod?.yr}`,
        `${stormglassData?.wavePeriod?.smhi}`,
        `${stormglassData?.wavePeriod?.sg}`,
        `${stormglassData?.wavePeriod?.sgSource}`,

        `${sofarData.windSpeed?.value}`,
        `${stormglassData?.windSpeed?.icon}`,
        `${stormglassData?.windSpeed?.dwd}`,
        `${stormglassData?.windSpeed?.noaa}`,
        `${stormglassData?.windSpeed?.meteo}`,
        `${stormglassData?.windSpeed?.meto}`,
        `${stormglassData?.windSpeed?.fcoo}`,
        `${stormglassData?.windSpeed?.fmi}`,
        `${stormglassData?.windSpeed?.yr}`,
        `${stormglassData?.windSpeed?.smhi}`,
        `${stormglassData?.windSpeed?.sg}`,
        `${stormglassData?.windSpeed?.sgSource}`,

        `${sofarData.windSpeed?.value}`,
        `${stormglassData?.windSpeed?.icon}`,
        `${stormglassData?.windSpeed?.dwd}`,
        `${stormglassData?.windSpeed?.noaa}`,
        `${stormglassData?.windSpeed?.meteo}`,
        `${stormglassData?.windSpeed?.meto}`,
        `${stormglassData?.windSpeed?.fcoo}`,
        `${stormglassData?.windSpeed?.fmi}`,
        `${stormglassData?.windSpeed?.yr}`,
        `${stormglassData?.windSpeed?.smhi}`,
        `${stormglassData?.windSpeed?.sg}`,
        `${stormglassData?.windSpeed?.sgSource}`,
      ].join(';');

      fs.writeFileSync(fd, `${row}\n`);
    }),
  );

  clearInterval(loading);
  console.log(
    `\r${total} sofar requests done in ${
      Math.round((sofarEnd - sofarStart) / 10) / 100
    }s`,
  );
  console.log(
    `${total} stormglass requests done in ${
      Math.round((stormglassEnd - stormglassStart) / 10) / 100
    }s`,
  );
};

main();
