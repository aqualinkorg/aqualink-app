import { Logger } from '@nestjs/common';
import { get, isNil, times } from 'lodash';
import moment from 'moment';
import { Connection, In, IsNull, Not, Repository } from 'typeorm';
import Bluebird from 'bluebird';
import { Point } from 'geojson';
import { Site } from '../sites/sites.entity';
import { Sources } from '../sites/sources.entity';
import { Metric } from '../time-series/metrics.entity';
import { TimeSeries } from '../time-series/time-series.entity';
import { getSpotterData, sofarForecast } from './sofar';
import {
  DEFAULT_SPOTTER_DATA_VALUE,
  SofarValue,
  SpotterData,
} from './sofar.types';
import { SourceType } from '../sites/schemas/source-type.enum';
import { ExclusionDates } from '../sites/exclusion-dates.entity';
import { excludeSpotterData } from './site.utils';
import { getSources } from './time-series.utils';
import { SofarModels, sofarVariableIDs } from './constants';
import { getWindDirection, getWindSpeed } from './math';
import { getSofarNearestAvailablePoint } from './sofar-availability';

interface Repositories {
  siteRepository: Repository<Site>;
  sourceRepository: Repository<Sources>;
  timeSeriesRepository: Repository<TimeSeries>;
  exclusionDatesRepository: Repository<ExclusionDates>;
}

const logger = new Logger('SpotterTimeSeries');

/**
 * Fetches all sites with where id is included in the siteIds array and has sensorId
 * If an empty array of siteIds is given then all sites with sensors are returned
 * @param siteIds The requested siteIds
 * @param siteRepository The required repository to make the query
 * @returns An array of site entities
 */
const getSites = (
  siteIds: number[],
  hasSensorOnly: boolean = false,
  siteRepository: Repository<Site>,
) => {
  return siteRepository.find({
    where: {
      ...(siteIds.length > 0 ? { id: In(siteIds) } : {}),
      ...(hasSensorOnly ? { sensorId: Not(IsNull()) } : {}),
    },
  });
};

/**
 * Fetches the exclusion dates for the selected sources.
 * @param sources The selected sources
 * @param exclusionDatesRepository The necessary repository to perform the query
 * @returns The requested exclusion date entities
 */
const getSpotterExclusionDates = (
  sources: Sources[],
  exclusionDatesRepository: Repository<ExclusionDates>,
) =>
  sources.map((source) =>
    exclusionDatesRepository.find({ where: { sensorId: source.sensorId } }),
  );

/**
 * Save data on time_series table
 * @param batch The batch of data to save
 * @param source The source of the data
 * @param metric The metric of data
 * @param timeSeriesRepository The needed repository to perform the query
 * @returns An InsertResult
 */
const saveDataBatch = (
  batch: SofarValue[],
  source: Sources,
  metric: Metric,
  timeSeriesRepository: Repository<TimeSeries>,
) => {
  // TODO - Filter out nil values
  return timeSeriesRepository
    .createQueryBuilder('time_series')
    .insert()
    .values(
      batch.map((data) => ({
        metric,
        value: data.value,
        timestamp: moment(data.timestamp).startOf('minute').toDate(),
        source,
      })),
    )
    .onConflict('ON CONSTRAINT "no_duplicate_data" DO NOTHING')
    .execute();
};

/**
 * Fetch spotter and wave data from sofar and save them on time_series table
 * @param siteIds The siteIds for which to perform the update
 * @param days How many days will this script need to backfill (1 = daily update)
 * @param connection An active typeorm connection object
 * @param repositories The needed repositories, as defined by the interface
 */
export const addSpotterData = async (
  siteIds: number[],
  days: number,
  connection: Connection,
  repositories: Repositories,
) => {
  logger.log('Fetching sites');
  // Fetch all sites
  const sites = await getSites(siteIds, true, repositories.siteRepository);

  logger.log('Fetching sources');
  // Fetch sources
  const spotterSources = await Promise.all(
    getSources(sites, SourceType.SPOTTER, repositories.sourceRepository),
  );

  const exclusionDates = await Promise.all(
    getSpotterExclusionDates(
      spotterSources,
      repositories.exclusionDatesRepository,
    ),
  );

  // Create a map from the siteIds to the source entities
  const siteToSource: Record<number, Sources> = Object.fromEntries(
    spotterSources.map((source) => [source.site.id, source]),
  );

  const sensorToExclusionDates: Record<string, ExclusionDates[]> =
    Object.fromEntries(
      exclusionDates
        .filter((exclusionDate) => exclusionDate?.[0]?.sensorId)
        .map((exclusionDate) => [exclusionDate[0].sensorId, exclusionDate]),
    );

  logger.log('Saving spotter data');
  await Bluebird.map(
    sites,
    (site) =>
      Bluebird.map(
        times(days),
        (i) => {
          const startDate = moment().subtract(i, 'd').startOf('day').toDate();
          const endDate = moment().subtract(i, 'd').endOf('day').toDate();

          if (!site.sensorId) {
            return DEFAULT_SPOTTER_DATA_VALUE;
          }

          const sensorExclusionDates = get(
            sensorToExclusionDates,
            site.sensorId,
            [],
          );

          // Fetch spotter and wave data from sofar
          return getSpotterData(site.sensorId, endDate, startDate).then(
            (data) => excludeSpotterData(data, sensorExclusionDates),
          );
        },
        { concurrency: 100 },
      )
        .then((spotterData) => {
          const dataLabels: [keyof SpotterData, Metric][] = [
            ['topTemperature', Metric.TOP_TEMPERATURE],
            ['bottomTemperature', Metric.BOTTOM_TEMPERATURE],
            ['significantWaveHeight', Metric.SIGNIFICANT_WAVE_HEIGHT],
            ['waveMeanDirection', Metric.WAVE_MEAN_DIRECTION],
            ['waveMeanPeriod', Metric.WAVE_MEAN_PERIOD],
            ['windDirection', Metric.WIND_DIRECTION],
            ['windSpeed', Metric.WIND_SPEED],
          ];

          // Save data to time_series
          return Promise.all(
            spotterData
              .map((dailySpotterData) =>
                dataLabels.map(([spotterDataLabel, metric]) =>
                  saveDataBatch(
                    dailySpotterData[spotterDataLabel] as SofarValue[], // We know that there would not be any undefined values here
                    siteToSource[site.id],
                    metric,
                    repositories.timeSeriesRepository,
                  ),
                ),
              )
              .flat(),
          );
        })
        .then(() => {
          // After each successful execution, log the event
          const startDate = moment()
            .subtract(days - 1, 'd')
            .startOf('day');
          const endDate = moment().endOf('day');
          logger.debug(
            `Spotter data updated for ${site.sensorId} between ${startDate} and ${endDate}`,
          );
        }),
    { concurrency: 1 },
  );

  // Update materialized view
  logger.log('Refreshing materialized view latest_data');
  await connection.query('REFRESH MATERIALIZED VIEW latest_data');
};

/**
 * Fetch spotter and wave data from sofar and save them on time_series table
 * @param siteIds The siteIds for which to perform the update
 * @param connection An active typeorm connection object
 * @param repositories The needed repositories, as defined by the interface
 */

export const addWindWaveData = async (
  siteIds: number[],
  connection: Connection,
  repositories: Repositories,
) => {
  logger.log('Fetching sites');
  // Fetch all sites
  const sites = await getSites(siteIds, false, repositories.siteRepository);

  logger.log('Fetching sources');
  // Fetch sources
  const gfsSources = await Promise.all(
    getSources(sites, SourceType.GFS, repositories.sourceRepository),
  );
  const sofarWaveSources = await Promise.all(
    getSources(
      sites,
      SourceType.SOFAR_WAVE_MODEL,
      repositories.sourceRepository,
    ),
  );

  // Create a map from the siteIds to the source entities
  const siteToGfsSource: Record<number, Sources> = Object.fromEntries(
    gfsSources.map((source) => [source.site.id, source]),
  );

  const siteToSofarWaveModelSource: Record<number, Sources> =
    Object.fromEntries(
      sofarWaveSources.map((source) => [source.site.id, source]),
    );

  const gfsDataLabels: [keyof SpotterData, Metric][] = [
    ['windDirection', Metric.WIND_DIRECTION],
    ['windSpeed', Metric.WIND_SPEED],
  ];

  const sofarDataLabels: [keyof SpotterData, Metric][] = [
    ['significantWaveHeight', Metric.SIGNIFICANT_WAVE_HEIGHT],
    ['waveMeanDirection', Metric.WAVE_MEAN_DIRECTION],
    ['waveMeanPeriod', Metric.WAVE_MEAN_PERIOD],
  ];

  logger.log('Saving wind & wave forecast data');
  await Bluebird.map(
    sites,
    async (site) => {
      const { polygon } = site;
      const point = (polygon as Point).coordinates;

      const [longitude, latitude] = getSofarNearestAvailablePoint(point);

      logger.log(
        `Saving wind & wave forecast data for ${site.id} at ${latitude} - ${longitude}`,
      );

      const [
        significantWaveHeight,
        waveMeanDirection,
        waveMeanPeriod,
        windVelocity10MeterEastward,
        windVelocity10MeterNorthward,
      ] = await Promise.all([
        sofarForecast(
          SofarModels.SofarOperationalWaveModel,
          sofarVariableIDs[SofarModels.SofarOperationalWaveModel]
            .significantWaveHeight,
          latitude,
          longitude,
        ),
        sofarForecast(
          SofarModels.SofarOperationalWaveModel,
          sofarVariableIDs[SofarModels.SofarOperationalWaveModel].meanDirection,
          latitude,
          longitude,
        ),
        sofarForecast(
          SofarModels.SofarOperationalWaveModel,
          sofarVariableIDs[SofarModels.SofarOperationalWaveModel].meanPeriod,
          latitude,
          longitude,
        ),
        sofarForecast(
          SofarModels.GFS,
          sofarVariableIDs[SofarModels.GFS].windVelocity10MeterEastward,
          latitude,
          longitude,
        ),
        sofarForecast(
          SofarModels.GFS,
          sofarVariableIDs[SofarModels.GFS].windVelocity10MeterNorthward,
          latitude,
          longitude,
        ),
      ]);

      // Calculate wind speed and direction from velocity
      const windNorhwardVelocity = windVelocity10MeterNorthward?.value;
      const windEastwardVelocity = windVelocity10MeterEastward?.value;
      const windSpeed = {
        timestamp: windVelocity10MeterNorthward?.timestamp,
        value: getWindSpeed(windEastwardVelocity, windNorhwardVelocity),
      };
      const windDirection = {
        timestamp: windVelocity10MeterNorthward?.timestamp,
        value: getWindDirection(windEastwardVelocity, windNorhwardVelocity),
      };

      const forecastData = {
        significantWaveHeight,
        waveMeanDirection,
        waveMeanPeriod,
        windSpeed,
        windDirection,
      };

      // Save wind forecast data to time_series
      await Promise.all(
        // eslint-disable-next-line array-callback-return, consistent-return
        gfsDataLabels.map(([dataLabel, metric]) => {
          if (
            !isNil(forecastData[dataLabel]?.value) &&
            !Number.isNaN(forecastData[dataLabel]?.value)
          ) {
            return saveDataBatch(
              [forecastData[dataLabel]] as SofarValue[], // We know that there would not be any undefined values here
              siteToGfsSource[site.id],
              metric,
              repositories.timeSeriesRepository,
            );
          }
        }),
      );

      // Save sofar wave forecast data to time_series
      await Promise.all(
        // eslint-disable-next-line array-callback-return, consistent-return
        sofarDataLabels.map(([dataLabel, metric]) => {
          if (
            !isNil(forecastData[dataLabel]?.value) &&
            !Number.isNaN(forecastData[dataLabel]?.value)
          ) {
            return saveDataBatch(
              [forecastData[dataLabel]] as SofarValue[], // We know that there would not be any undefined values here
              siteToSofarWaveModelSource[site.id],
              metric,
              repositories.timeSeriesRepository,
            );
          }
        }),
      );
    },
    { concurrency: 4 },
  );

  // Update materialized view
  logger.log('Refreshing materialized view latest_data');
  await connection.query('REFRESH MATERIALIZED VIEW latest_data');
};
