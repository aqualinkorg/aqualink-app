import { Logger } from '@nestjs/common';
import Bluebird from 'bluebird';
import { Point } from 'geojson';
import moment from 'moment';
import { Repository } from 'typeorm';
import { Site } from '../sites/sites.entity';
import { ForecastData } from '../wind-wave-data/wind-wave-data.entity';
import { SofarModels, sofarVariableIDs } from './constants';
import { getWindDirection, getWindSpeed } from './math';
import { sofarHindcast } from './sofar';
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

      // get latest date
      const timestamp = [
        significantWaveHeight,
        waveMeanDirection,
        waveMeanPeriod,
        windVelocity10MeterEastward,
        windVelocity10MeterNorthward,
      ].reduce((prev, curr) => {
        if (!curr) return prev;
        return curr.timestamp > prev ? curr.timestamp : prev;
      }, '');

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

      await repositories.hindcastRepository
        .createQueryBuilder('forecast_data')
        .insert()
        .values([
          {
            site,
            timestamp: moment(timestamp).startOf('minute').toDate(),
            significantWaveHeight: significantWaveHeight?.value,
            meanDirection: waveMeanDirection?.value,
            meanPeriod: waveMeanPeriod?.value,
            windSpeed: windSpeed.value,
            windDirection: windDirection.value,
            updatedAt: today,
          },
        ])
        .onConflict(
          `("site_id") DO UPDATE SET "timestamp" = excluded."timestamp", "significant_wave_height" = excluded."significant_wave_height", "mean_direction" = excluded."mean_direction", "mean_period" = excluded."mean_period", "wind_speed" = excluded."wind_speed", "wind_direction" = excluded."wind_direction", "updated_at" = excluded."updated_at"`,
        )
        .execute();
    },
    { concurrency: 4 },
  );
  logger.log('Completed updating hindcast data');
};
