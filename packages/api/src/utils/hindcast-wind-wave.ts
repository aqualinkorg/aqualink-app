import { Logger } from '@nestjs/common';
import pLimit from 'p-limit';
import { Point } from 'geojson';
import { isNil } from 'lodash';
import { In, Repository } from 'typeorm';
import { DateTime } from '../luxon-extensions';
import { SourceType } from '../sites/schemas/source-type.enum';
import { Site } from '../sites/sites.entity';
import { ForecastData } from '../wind-wave-data/forecast-data.entity';
import { WindWaveMetric } from '../wind-wave-data/wind-wave-data.types';
import { SofarModels, sofarVariableIDs } from './constants';
import { getWindDirection, getWindSpeed } from './math';
import { isOpenMeteoEnabled, openMeteoMarineBatch } from './open-meteo';
import { sofarHindcast } from './sofar';
import { getSofarNearestAvailablePoint } from './sofar-availability';
import { ValueWithTimestamp } from './sofar.types';

const logger = new Logger('hindcastWindWaveData');

interface Repositories {
  siteRepository: Repository<Site>;
  hindcastRepository: Repository<ForecastData>;
}

const getTodayYesterdayDates = () => {
  const date = new Date();
  const yesterdayDate = new Date(date);
  yesterdayDate.setDate(date.getDate() - 1);
  const today = date.toISOString();
  const yesterday = yesterdayDate.toISOString();
  return { today, yesterday };
};

/**
 * Original combined Sofar wave+wind fetch, kept unchanged and exported for
 * backward compatibility with scripts/generate-stormglass-csv.ts, which
 * depends on this exact function. Not used by the scheduled ingest paths
 * below — waves come from Open-Meteo and wind from getWindData.
 */
export const getForecastData = async (latitude: number, longitude: number) => {
  const { today, yesterday } = getTodayYesterdayDates();
  const hindcastOptions = [
    [
      SofarModels.Wave,
      sofarVariableIDs[SofarModels.Wave].significantWaveHeight,
    ],
    [SofarModels.Wave, sofarVariableIDs[SofarModels.Wave].meanDirection],
    [SofarModels.Wave, sofarVariableIDs[SofarModels.Wave].meanPeriod],
    [
      SofarModels.Atmosphere,
      sofarVariableIDs[SofarModels.Atmosphere].windVelocity10MeterEastward,
    ],
    [
      SofarModels.Atmosphere,
      sofarVariableIDs[SofarModels.Atmosphere].windVelocity10MeterNorthward,
    ],
  ];

  const response = await Promise.all(
    hindcastOptions.map(([sofarModel, sofarVariableId]) =>
      sofarHindcast(
        sofarModel,
        sofarVariableId,
        latitude,
        longitude,
        yesterday,
        today,
      ),
    ),
  );

  const [
    significantWaveHeight,
    waveMeanDirection,
    waveMeanPeriod,
    windVelocity10MeterEastward,
    windVelocity10MeterNorthward,
  ] = response.map((x) => {
    if (!x || x.values.length < 1) return undefined;
    return x.values[x.values.length - 1]; // latest available forecast in the past
  });

  const windNorthwardVelocity = windVelocity10MeterNorthward?.value;
  const windEastwardVelocity = windVelocity10MeterEastward?.value;
  const sameTimestamps =
    windVelocity10MeterEastward?.timestamp ===
    windVelocity10MeterNorthward?.timestamp;
  const windSpeed: ValueWithTimestamp | undefined =
    windNorthwardVelocity && windEastwardVelocity && sameTimestamps
      ? {
          timestamp: windVelocity10MeterNorthward?.timestamp,
          value: getWindSpeed(windEastwardVelocity, windNorthwardVelocity),
        }
      : undefined;
  const windDirection: ValueWithTimestamp | undefined =
    windNorthwardVelocity && windEastwardVelocity && sameTimestamps
      ? {
          timestamp: windVelocity10MeterNorthward?.timestamp,
          value: getWindDirection(windEastwardVelocity, windNorthwardVelocity),
        }
      : undefined;

  return {
    significantWaveHeight,
    waveMeanDirection,
    waveMeanPeriod,
    windSpeed,
    windDirection,
  };
};

/**
 * Fetch wind data (eastward/northward velocity) from Sofar's GFS-backed
 * Atmosphere model and derive speed + direction.
 */
const getWindData = async (latitude: number, longitude: number) => {
  const { today, yesterday } = getTodayYesterdayDates();

  const [windEastwardRaw, windNorthwardRaw] = await Promise.all([
    sofarHindcast(
      SofarModels.Atmosphere,
      sofarVariableIDs[SofarModels.Atmosphere].windVelocity10MeterEastward,
      latitude,
      longitude,
      yesterday,
      today,
    ),
    sofarHindcast(
      SofarModels.Atmosphere,
      sofarVariableIDs[SofarModels.Atmosphere].windVelocity10MeterNorthward,
      latitude,
      longitude,
      yesterday,
      today,
    ),
  ]);

  const windVelocity10MeterEastward =
    windEastwardRaw && windEastwardRaw.values.length > 0
      ? windEastwardRaw.values[windEastwardRaw.values.length - 1]
      : undefined;
  const windVelocity10MeterNorthward =
    windNorthwardRaw && windNorthwardRaw.values.length > 0
      ? windNorthwardRaw.values[windNorthwardRaw.values.length - 1]
      : undefined;

  const eastward = windVelocity10MeterEastward?.value;
  const northward = windVelocity10MeterNorthward?.value;
  const sameTimestamps =
    windVelocity10MeterEastward?.timestamp ===
    windVelocity10MeterNorthward?.timestamp;

  const windSpeed: ValueWithTimestamp | undefined =
    eastward !== undefined && northward !== undefined && sameTimestamps
      ? {
          timestamp: windVelocity10MeterNorthward!.timestamp,
          value: getWindSpeed(eastward, northward),
        }
      : undefined;
  const windDirection: ValueWithTimestamp | undefined =
    eastward !== undefined && northward !== undefined && sameTimestamps
      ? {
          timestamp: windVelocity10MeterNorthward!.timestamp,
          value: getWindDirection(eastward, northward),
        }
      : undefined;

  return { windSpeed, windDirection };
};

type ForecastMetricValue = {
  metric: WindWaveMetric;
  source: SourceType;
  value: ValueWithTimestamp;
};

const upsertForecastMetrics = async (
  site: Site,
  metrics: ForecastMetricValue[],
  repositories: Repositories,
  updatedAt: string,
) => {
  await Promise.all(
    // eslint-disable-next-line array-callback-return, consistent-return
    metrics.map(({ metric, source, value }) => {
      if (!isNil(value?.value) && !Number.isNaN(value?.value)) {
        return repositories.hindcastRepository
          .createQueryBuilder('forecast_data')
          .insert()
          .values([
            {
              site,
              timestamp: DateTime.fromISO(value.timestamp, {
                zone: 'utc',
              })
                .startOf('minute')
                .toJSDate(),
              metric,
              source,
              value: value.value,
              updatedAt,
            },
          ])
          .onConflict(
            `ON CONSTRAINT "one_row_per_site_per_metric_per_source" DO UPDATE SET "timestamp" = excluded."timestamp", "updated_at" = excluded."updated_at", "value" = excluded."value"`,
          )
          .execute();
      }
    }),
  );
};

const fetchSites = async (siteIds: number[], repositories: Repositories) => {
  logger.log('Fetching sites');
  return repositories.siteRepository.find({
    where: {
      ...(siteIds.length > 0 ? { id: In(siteIds) } : {}),
    },
  });
};

/**
 * Fetch wave forecast data from Open-Meteo and persist it to forecast_data.
 *
 * @param siteIds The siteIds for which to perform the update. If empty,
 *                all sites are updated.
 */
export const addWaveData = async (
  siteIds: number[],
  repositories: Repositories,
) => {
  if (!isOpenMeteoEnabled()) {
    logger.warn(
      'Open-Meteo fetching paused (OPEN_METEO_ENABLED is not true). Skipping wave update.',
    );
    return;
  }

  const sites = await fetchSites(siteIds, repositories);
  const { today } = getTodayYesterdayDates();

  logger.log(`Fetching wave data from Open-Meteo for ${sites.length} sites`);
  const waveCoordinates: Array<[number, number]> = sites.map((site) => {
    const [longitude, latitude] = (site.polygon as Point).coordinates;
    return [latitude, longitude];
  });
  const waveResults = await openMeteoMarineBatch(waveCoordinates);

  logger.log('Saving wave forecast data');
  const limit = pLimit(20);
  await Promise.all(
    sites.map((site, idx) =>
      limit(async () => {
        const waveData = waveResults[idx];
        if (!waveData) {
          return;
        }

        logger.log(`Saving wave forecast data for ${site.id}`);

        await upsertForecastMetrics(
          site,
          [
            {
              metric: WindWaveMetric.SIGNIFICANT_WAVE_HEIGHT,
              source: SourceType.OPEN_METEO,
              value: waveData.waveHeight!,
            },
            {
              metric: WindWaveMetric.WAVE_MEAN_DIRECTION,
              source: SourceType.OPEN_METEO,
              value: waveData.waveDirection!,
            },
            {
              metric: WindWaveMetric.WAVE_MEAN_PERIOD,
              source: SourceType.OPEN_METEO,
              value: waveData.wavePeriod!,
            },
          ].filter((entry) => !isNil(entry.value?.value)),
          repositories,
          today,
        );
      }),
    ),
  );
  logger.log('Completed updating wave hindcast data');
};

/**
 * Fetch wind forecast data from Sofar GFS and persist it to forecast_data.
 * Dedupes Sofar requests by nearest available grid point — many sites share
 * the same point, which keeps a full run under the Cloud Function timeout.
 *
 * @param siteIds The siteIds for which to perform the update. If empty,
 *                all sites are updated.
 */
export const addWindData = async (
  siteIds: number[],
  repositories: Repositories,
) => {
  const sites = await fetchSites(siteIds, repositories);
  const { today } = getTodayYesterdayDates();

  logger.log(`Fetching wind data from Sofar for ${sites.length} sites`);

  type WindResult = Awaited<ReturnType<typeof getWindData>>;
  const windByGridPoint = new Map<string, Promise<WindResult>>();

  const getCachedWindData = (latitude: number, longitude: number) => {
    const key = `${latitude},${longitude}`;
    const cached = windByGridPoint.get(key);
    if (cached) {
      return cached;
    }
    const request = getWindData(latitude, longitude);
    windByGridPoint.set(key, request);
    return request;
  };

  const limit = pLimit(10);
  await Promise.all(
    sites.map((site) =>
      limit(async () => {
        const { polygon } = site;
        const [sofarLongitude, sofarLatitude] = getSofarNearestAvailablePoint(
          polygon as Point,
        );

        logger.log(
          `Saving wind forecast data for ${site.id} at ${sofarLatitude} - ${sofarLongitude}`,
        );

        const windData = await getCachedWindData(sofarLatitude, sofarLongitude);

        await upsertForecastMetrics(
          site,
          [
            {
              metric: WindWaveMetric.WIND_SPEED,
              source: SourceType.GFS,
              value: windData.windSpeed!,
            },
            {
              metric: WindWaveMetric.WIND_DIRECTION,
              source: SourceType.GFS,
              value: windData.windDirection!,
            },
          ].filter((entry) => !isNil(entry.value?.value)),
          repositories,
          today,
        );
      }),
    ),
  );
  logger.log(
    `Completed updating wind hindcast data (${windByGridPoint.size} unique Sofar grid points)`,
  );
};

/**
 * Fetch wave and wind forecast data and persist both. Kept for the CLI
 * script; scheduled Cloud Functions call addWaveData / addWindData separately
 * so each stays under the 540s timeout.
 */
export const addWindWaveData = async (
  siteIds: number[],
  repositories: Repositories,
) => {
  await addWaveData(siteIds, repositories);
  await addWindData(siteIds, repositories);
};
