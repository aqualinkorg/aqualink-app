import { Logger } from '@nestjs/common';
import Bluebird from 'bluebird';
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
import { sofarHindcast } from './sofar';
import { getSofarNearestAvailablePoint } from './sofar-availability';
import { ValueWithTimestamp, SpotterData } from './sofar.types';

const logger = new Logger('hindcastWindWaveData');

const dataLabels: [keyof SpotterData, WindWaveMetric, SourceType][] = [
  [
    'significantWaveHeight',
    WindWaveMetric.SIGNIFICANT_WAVE_HEIGHT,
    SourceType.SOFAR_MODEL,
  ],
  [
    'waveMeanDirection',
    WindWaveMetric.WAVE_MEAN_DIRECTION,
    SourceType.SOFAR_MODEL,
  ],
  ['waveMeanPeriod', WindWaveMetric.WAVE_MEAN_PERIOD, SourceType.SOFAR_MODEL],
  ['windDirection', WindWaveMetric.WIND_DIRECTION, SourceType.GFS],
  ['windSpeed', WindWaveMetric.WIND_SPEED, SourceType.GFS],
];

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
    hindcastOptions.map(([sofarModel, sofarVariableId]) => {
      return sofarHindcast(
        sofarModel,
        sofarVariableId,
        latitude,
        longitude,
        yesterday,
        today,
      );
    }),
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

  // Calculate wind speed and direction from velocity
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
 * Fetch spotter and wave data from sofar and save them on time_series table
 * @param siteIds The siteIds for which to perform the update
 * @param connection An active typeorm connection object
 * @param repositories The needed repositories, as defined by the interface
 */
export const addWindWaveData = async (
  siteIds: number[],
  repositories: Repositories,
) => {
  logger.log('Fetching sites');
  // Fetch all sites
  const sites = await repositories.siteRepository.find({
    where: {
      ...(siteIds.length > 0 ? { id: In(siteIds) } : {}),
    },
  });

  const { today } = getTodayYesterdayDates();

  logger.log('Saving wind & wave forecast data');
  await Bluebird.map(
    sites,
    async (site) => {
      const { polygon } = site;

      const [longitude, latitude] = getSofarNearestAvailablePoint(
        polygon as Point,
      );

      logger.log(
        `Saving wind & wave forecast data for ${site.id} at ${latitude} - ${longitude}`,
      );

      const forecastData = await getForecastData(latitude, longitude);

      // Save wind wave data to forecast_data
      await Promise.all(
        // eslint-disable-next-line array-callback-return, consistent-return
        dataLabels.map(([dataLabel, metric, source]) => {
          const sofarValue = forecastData[dataLabel] as ValueWithTimestamp;
          if (!isNil(sofarValue?.value) && !Number.isNaN(sofarValue?.value)) {
            return repositories.hindcastRepository
              .createQueryBuilder('forecast_data')
              .insert()
              .values([
                {
                  site,
                  timestamp: DateTime.fromISO(sofarValue.timestamp)
                    .startOf('minute')
                    .toJSDate(),
                  metric,
                  source,
                  value: sofarValue.value,
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
    },
    { concurrency: 4 },
  );
  logger.log('Completed updating hindcast data');
};
