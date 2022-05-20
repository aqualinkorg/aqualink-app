import { Logger } from '@nestjs/common';
import Bluebird from 'bluebird';
import { Point } from 'geojson';
import { isNil } from 'lodash';
import moment from 'moment';
import { Repository } from 'typeorm';
import { Site } from '../sites/sites.entity';
import {
  ForecastData,
  WindWaveMetric,
} from '../wind-wave-data/wind-wave-data.entity';
import { SofarModels, sofarVariableIDs } from './constants';
import { getWindDirection, getWindSpeed } from './math';
import { sofarHindcast } from './sofar';
import { SofarValue, SpotterData } from './sofar.types';
import { getSites } from './spotter-time-series';

const logger = new Logger('hindcastWindWaveData');

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
  const yesterdayDate = new Date(date.getTime());
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

      const response = await Promise.all([
        sofarHindcast(
          SofarModels.SofarOperationalWaveModel,
          sofarVariableIDs[SofarModels.SofarOperationalWaveModel]
            .significantWaveHeight,
          latitude,
          longitude,
          yesterday,
          today,
        ),
        sofarHindcast(
          SofarModels.SofarOperationalWaveModel,
          sofarVariableIDs[SofarModels.SofarOperationalWaveModel].meanDirection,
          latitude,
          longitude,
          yesterday,
          today,
        ),
        sofarHindcast(
          SofarModels.SofarOperationalWaveModel,
          sofarVariableIDs[SofarModels.SofarOperationalWaveModel].meanPeriod,
          latitude,
          longitude,
          yesterday,
          today,
        ),
        sofarHindcast(
          SofarModels.GFS,
          sofarVariableIDs[SofarModels.GFS].windVelocity10MeterEastward,
          latitude,
          longitude,
          yesterday,
          today,
        ),
        sofarHindcast(
          SofarModels.GFS,
          sofarVariableIDs[SofarModels.GFS].windVelocity10MeterNorthward,
          latitude,
          longitude,
          yesterday,
          today,
        ),
      ]);

      const [
        significantWaveHeight,
        waveMeanDirection,
        waveMeanPeriod,
        windVelocity10MeterEastward,
        windVelocity10MeterNorthward,
      ] = response.map((x) => {
        if (!x) return undefined;
        return x.values[x.values.length - 1]; // latest available forecast in the past
      });

      // Calculate wind speed and direction from velocity
      // TODO: treat undefined better
      const windNorthwardVelocity = windVelocity10MeterNorthward?.value || 0;
      const windEastwardVelocity = windVelocity10MeterEastward?.value || 0;
      const windSpeed = {
        timestamp: windVelocity10MeterNorthward?.timestamp,
        value: getWindSpeed(windEastwardVelocity, windNorthwardVelocity),
      };
      const windDirection = {
        timestamp: windVelocity10MeterNorthward?.timestamp,
        value: getWindDirection(windEastwardVelocity, windNorthwardVelocity),
      };

      const dataLabels: [keyof SpotterData, WindWaveMetric][] = [
        ['significantWaveHeight', WindWaveMetric.SIGNIFICANT_WAVE_HEIGHT],
        ['waveMeanDirection', WindWaveMetric.WAVE_MEAN_DIRECTION],
        ['waveMeanPeriod', WindWaveMetric.WAVE_MEAN_PERIOD],
        ['windDirection', WindWaveMetric.WIND_DIRECTION],
        ['windSpeed', WindWaveMetric.WIND_SPEED],
      ];

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
          if (
            !isNil(forecastData[dataLabel]?.value) &&
            !Number.isNaN(forecastData[dataLabel]?.value)
          ) {
            return repositories.hindcastRepository
              .createQueryBuilder('forecast_data')
              .insert()
              .values(
                [1].map(() => {
                  const value = forecastData[dataLabel] as SofarValue;
                  return {
                    site,
                    timestamp: moment(value.timestamp)
                      .startOf('minute')
                      .toDate(),
                    metric,
                    value: value.value,
                    updatedAt: today,
                  };
                }),
              )
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
