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
import { openMeteoMarineBatch } from './open-meteo';
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
 * depends on this exact function. Not used by addWindWaveData below —
 * that now sources wave data from Open-Meteo instead (see getWindData).
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
 * Atmosphere model and derive speed + direction. Used by addWindWaveData
 * below. Wave data is fetched separately, in bulk, via Open-Meteo.
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

interface CombinedWindWaveData {
  significantWaveHeight?: ValueWithTimestamp;
  waveMeanDirection?: ValueWithTimestamp;
  waveMeanPeriod?: ValueWithTimestamp;
  windSpeed?: ValueWithTimestamp;
  windDirection?: ValueWithTimestamp;
}

const dataLabels: [keyof CombinedWindWaveData, WindWaveMetric, SourceType][] = [
  [
    'significantWaveHeight',
    WindWaveMetric.SIGNIFICANT_WAVE_HEIGHT,
    SourceType.OPEN_METEO,
  ],
  [
    'waveMeanDirection',
    WindWaveMetric.WAVE_MEAN_DIRECTION,
    SourceType.OPEN_METEO,
  ],
  ['waveMeanPeriod', WindWaveMetric.WAVE_MEAN_PERIOD, SourceType.OPEN_METEO],
  ['windDirection', WindWaveMetric.WIND_DIRECTION, SourceType.GFS],
  ['windSpeed', WindWaveMetric.WIND_SPEED, SourceType.GFS],
];

/**
 * Fetch wave and wind forecast data and persist it to forecast_data.
 *
 * Wave data is fetched in batched multi-coordinate calls to the Open-Meteo
 * Marine API. Wind data is fetched per site from Sofar's GFS-backed
 * Atmosphere model (unchanged from prior behaviour).
 *
 * @param siteIds The siteIds for which to perform the update. If empty,
 *                all sites are updated.
 * @param repositories The needed repositories, as defined by the interface.
 */
export const addWindWaveData = async (
  siteIds: number[],
  repositories: Repositories,
) => {
  logger.log('Fetching sites');
  const sites = await repositories.siteRepository.find({
    where: {
      ...(siteIds.length > 0 ? { id: In(siteIds) } : {}),
    },
  });

  const { today } = getTodayYesterdayDates();

  logger.log(`Fetching wave data from Open-Meteo for ${sites.length} sites`);
  const waveCoordinates: Array<[number, number]> = sites.map((site) => {
    const [longitude, latitude] = (site.polygon as Point).coordinates;
    return [latitude, longitude];
  });
  const waveResults = await openMeteoMarineBatch(waveCoordinates);

  logger.log('Saving wind & wave forecast data');
  const limit = pLimit(10);
  await Promise.all(
    sites.map((site, idx) =>
      limit(async () => {
        const { polygon } = site;

        const [sofarLongitude, sofarLatitude] = getSofarNearestAvailablePoint(
          polygon as Point,
        );

        logger.log(
          `Saving wind & wave forecast data for ${site.id} at ${sofarLatitude} - ${sofarLongitude}`,
        );

        const waveData = waveResults[idx];
        const windData = await getWindData(sofarLatitude, sofarLongitude);

        const combinedData: CombinedWindWaveData = {
          significantWaveHeight: waveData?.waveHeight,
          waveMeanDirection: waveData?.waveDirection,
          waveMeanPeriod: waveData?.wavePeriod,
          windSpeed: windData.windSpeed,
          windDirection: windData.windDirection,
        };

        await Promise.all(
          // eslint-disable-next-line array-callback-return, consistent-return
          dataLabels.map(([dataLabel, metric, source]) => {
            const value = combinedData[dataLabel];
            if (!isNil(value?.value) && !Number.isNaN(value?.value)) {
              return repositories.hindcastRepository
                .createQueryBuilder('forecast_data')
                .insert()
                .values([
                  {
                    site,
                    timestamp: DateTime.fromISO(value!.timestamp, {
                      zone: 'utc',
                    })
                      .startOf('minute')
                      .toJSDate(),
                    metric,
                    source,
                    value: value!.value,
                    updatedAt: today,
                  },
                ])
                .onConflict(
                  `ON CONSTRAINT "one_row_per_site_per_metric_per_source" DO UPDATE SET "timestamp" = excluded."timestamp", "updated_at" = excluded."updated_at", "value" = excluded."value"`,
                )
                .execute();
            }
          }),
        );
      }),
    ),
  );
  logger.log('Completed updating hindcast data');
};
