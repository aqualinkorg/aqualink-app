import { Logger } from '@nestjs/common';
import Bluebird from 'bluebird';
import { Point } from 'geojson';
import { isNil } from 'lodash';
import moment from 'moment';
import { Repository } from 'typeorm';
import { Site } from '../sites/sites.entity';
import { ForecastData } from '../wind-wave-data/wind-wave-data.entity';
import { WindWaveMetric } from '../wind-wave-data/wind-wave-data.types';
import { SofarModels, sofarVariableIDs } from './constants';
import { getWindDirection, getWindSpeed } from './math';
import { sofarHindcast } from './sofar';
import { SofarValue, SpotterData } from './sofar.types';
import { getSites } from './spotter-time-series';

const logger = new Logger('hindcastWindWaveData');

const dataLabels: [keyof SpotterData, WindWaveMetric][] = [
  ['significantWaveHeight', WindWaveMetric.SIGNIFICANT_WAVE_HEIGHT],
  ['waveMeanDirection', WindWaveMetric.WAVE_MEAN_DIRECTION],
  ['waveMeanPeriod', WindWaveMetric.WAVE_MEAN_PERIOD],
  ['windDirection', WindWaveMetric.WIND_DIRECTION],
  ['windSpeed', WindWaveMetric.WIND_SPEED],
];

interface Repositories {
  siteRepository: Repository<Site>;
  hindcastRepository: Repository<ForecastData>;
}

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
  const sites = await getSites(siteIds, false, repositories.siteRepository);

  const date = new Date();
  const yesterdayDate = new Date(date);
  yesterdayDate.setDate(date.getDate() - 1);
  const today = date.toISOString();
  const yesterday = yesterdayDate.toISOString();

  logger.log('Saving wind & wave forecast data');
  await Bluebird.map(
    sites,
    async (site) => {
      const { polygon } = site;
      const [longitude, latitude] = (polygon as Point).coordinates;

      logger.log(
        `Saving wind & wave forecast data for ${site.id} at ${latitude} - ${longitude}`,
      );

      const hindcastOptions = [
        [
          SofarModels.SofarOperationalWaveModel,
          sofarVariableIDs[SofarModels.SofarOperationalWaveModel]
            .significantWaveHeight,
        ],
        [
          SofarModels.SofarOperationalWaveModel,
          sofarVariableIDs[SofarModels.SofarOperationalWaveModel].meanDirection,
        ],
        [
          SofarModels.SofarOperationalWaveModel,
          sofarVariableIDs[SofarModels.SofarOperationalWaveModel].meanPeriod,
        ],
        [
          SofarModels.GFS,
          sofarVariableIDs[SofarModels.GFS].windVelocity10MeterEastward,
        ],
        [
          SofarModels.GFS,
          sofarVariableIDs[SofarModels.GFS].windVelocity10MeterNorthward,
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
      // TODO: treat undefined better
      const windNorthwardVelocity = windVelocity10MeterNorthward?.value;
      const windEastwardVelocity = windVelocity10MeterEastward?.value;
      const sameTimestamps =
        windVelocity10MeterEastward?.timestamp ===
        windVelocity10MeterNorthward?.timestamp;
      const windSpeed: SofarValue | undefined =
        windNorthwardVelocity && windEastwardVelocity && sameTimestamps
          ? {
              timestamp: windVelocity10MeterNorthward?.timestamp,
              value: getWindSpeed(windEastwardVelocity, windNorthwardVelocity),
            }
          : undefined;
      const windDirection: SofarValue | undefined =
        windNorthwardVelocity && windEastwardVelocity && sameTimestamps
          ? {
              timestamp: windVelocity10MeterNorthward?.timestamp,
              value: getWindDirection(
                windEastwardVelocity,
                windNorthwardVelocity,
              ),
            }
          : undefined;

      const forecastData = {
        significantWaveHeight,
        waveMeanDirection,
        waveMeanPeriod,
        windSpeed,
        windDirection,
      };

      // Save wind wave data to forecast_data
      await Promise.all(
        // eslint-disable-next-line array-callback-return, consistent-return
        dataLabels.map(([dataLabel, metric]) => {
          const sofarValue = forecastData[dataLabel] as SofarValue;
          if (!isNil(sofarValue?.value) && !Number.isNaN(sofarValue?.value)) {
            return repositories.hindcastRepository
              .createQueryBuilder('forecast_data')
              .insert()
              .values([
                {
                  site,
                  timestamp: moment(sofarValue.timestamp)
                    .startOf('minute')
                    .toDate(),
                  metric,
                  value: sofarValue.value,
                  updatedAt: today,
                },
              ])
              .onConflict(
                `ON CONSTRAINT "one_row_per_site_per_metric" DO UPDATE SET "timestamp" = excluded."timestamp", "updated_at" = excluded."updated_at", "value" = excluded."value"`,
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
