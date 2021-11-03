import { Logger } from '@nestjs/common';
import Bluebird from 'bluebird';
import { Connection, In, Repository } from 'typeorm';
import { Point } from 'geojson';
import { isNil, times } from 'lodash';
import moment from 'moment';

import { Site } from '../sites/sites.entity';
import { Sources } from '../sites/sources.entity';
import { TimeSeries } from '../time-series/time-series.entity';
import { SofarModels, sofarVariableIDs } from './constants';
import { filterSofarResponse, getLatestData, sofarHindcast } from './sofar';
import { getNOAASource, insertSiteDataToTimeSeries } from './time-series.utils';
import { Metric } from '../time-series/metrics.entity';
import { calculateAlertLevel } from './bleachingAlert';
import { getSstAnomaly } from './liveData';
import { SofarValue } from './sofar.types';

interface Repositories {
  siteRepository: Repository<Site>;
  sourceRepository: Repository<Sources>;
  timeSeriesRepository: Repository<TimeSeries>;
}

// Initialize Nest logger
const logger = new Logger('SSTTimeSeries');

/**
 * Get sites entities based on the given siteIds array.
 * If an empty array was given then this function returns all sites
 * @param siteIds The siteIds to return
 * @param siteRepository The repository needed to perform the query
 * @returns A site array with all the requested sites. If no siteIds request then returns all sites available.
 */
const getSites = (siteIds: number[], siteRepository: Repository<Site>) => {
  return siteRepository.find({
    where: siteIds.length > 0 ? { id: In(siteIds) } : {},
    relations: ['historicalMonthlyMean'],
  });
};

/**
 * A function to fetch satellite temperature data and degree heating weeks from sofar,
 * calculate the sstAnomaly, dailyAlert and weeklyAlert
 * and save all above metrics to time_series table
 * @param siteIds The siteIds for which to perform the update
 * @param days How many days will this script need to backfill (1 = daily update)
 * @param connection An active typeorm connection object
 * @param repositories The needed repositories, as defined by the interface
 */
export const updateSST = async (
  siteIds: number[],
  days: number,
  connection: Connection,
  repositories: Repositories,
) => {
  const {
    siteRepository,
    timeSeriesRepository,
    sourceRepository,
  } = repositories;

  logger.log('Fetching sites');
  // Fetch sites entities
  const sites = await getSites(siteIds, siteRepository);

  // Fetch sources
  const sources = await Promise.all(
    sites.map((site) => {
      return getNOAASource(site, sourceRepository);
    }),
  );

  await Bluebird.map(
    sources,
    async (source) => {
      const { site } = source;
      const point = site.polygon as Point;
      // Extract site coordinates
      const [longitude, latitude] = point.coordinates;

      logger.log(`Back-filling site with id ${site.id}.`);

      const data = await Bluebird.map(
        times(days),
        // A non-async function is used on purpose.
        // We need for as many http request to be performed simultaneously without one blocking the other
        // This way we get a much greater speed up due to the concurrency.
        (i) => {
          const endDate =
            i === 0
              ? moment().format()
              : moment().subtract(i, 'd').endOf('day').format();
          const startDate = moment().subtract(i, 'd').startOf('day').format();

          // use Promise/then to increase concurrency since await halts the event loop
          return Promise.all([
            // Fetch satellite surface temperature data
            sofarHindcast(
              SofarModels.NOAACoralReefWatch,
              sofarVariableIDs[SofarModels.NOAACoralReefWatch]
                .analysedSeaSurfaceTemperature,
              latitude,
              longitude,
              startDate,
              endDate,
            ),
            // Fetch degree heating weeks data
            sofarHindcast(
              SofarModels.NOAACoralReefWatch,
              sofarVariableIDs[SofarModels.NOAACoralReefWatch]
                .degreeHeatingWeek,
              latitude,
              longitude,
              startDate,
              endDate,
            ),
          ]).then(([SofarSSTRaw, sofarDegreeHeatingWeekRaw]) => {
            // Filter out null values
            const sstFiltered = filterSofarResponse(SofarSSTRaw);
            const dhwFiltered = filterSofarResponse(sofarDegreeHeatingWeekRaw);
            // Get latest dhw
            const latestDhw = getLatestData(dhwFiltered);
            // Get alert level
            const alertLevel = calculateAlertLevel(
              site.maxMonthlyMean,
              getLatestData(sstFiltered)?.value,
              // Calculate degree heating days
              latestDhw && latestDhw.value * 7,
            );

            // Calculate the sstAnomaly
            const sstAnomaly = sstFiltered
              .map((sst) => ({
                value: getSstAnomaly(site.historicalMonthlyMean, sst),
                timestamp: sst.timestamp,
              }))
              // Filter out null values
              .filter((sstAnomalyValue) => {
                return !isNil(sstAnomalyValue.value);
              }) as SofarValue[];

            // return calculated metrics (sst, dhw, sstAnomaly alert)
            return {
              sst: sstFiltered,
              dhw: dhwFiltered,
              sstAnomaly,
              alert:
                alertLevel !== undefined
                  ? [
                      {
                        value: alertLevel,
                        timestamp: moment().subtract(i, 'd').hour(12).format(),
                      },
                    ]
                  : [],
            };
          });
        },
        { concurrency: 100 },
      );

      return Bluebird.map(
        data,
        // Save data on time_series table
        ({ sst, dhw, alert, sstAnomaly }) =>
          Promise.all([
            insertSiteDataToTimeSeries(
              sst,
              Metric.SATELLITE_TEMPERATURE,
              source,
              timeSeriesRepository,
            ),
            insertSiteDataToTimeSeries(
              dhw,
              Metric.DHW,
              source,
              timeSeriesRepository,
            ),
            insertSiteDataToTimeSeries(
              alert,
              Metric.ALERT,
              source,
              timeSeriesRepository,
            ),
            insertSiteDataToTimeSeries(
              sstAnomaly,
              Metric.SST_ANOMALY,
              source,
              timeSeriesRepository,
            ),
          ]),
        { concurrency: 100 },
      );
    },
    // Speed up if this is just a daily update
    // Concurrency should remain low, otherwise it will overwhelm the sofar api server
    { concurrency: days <= 5 ? 10 : 1 },
  );

  logger.log('Back-filling weekly alert level');
  // We calculate weekly alert separately because it depends on values of alert levels across 7 days
  await Bluebird.map(
    times(days),
    async (i) => {
      const endDate =
        i === 0
          ? moment().format()
          : moment().subtract(i, 'd').endOf('day').format();

      logger.log(`Back-filling weekly alert for ${endDate}`);
      // Calculate max alert by fetching the max alert in the last 7 days
      // As timestamp it is selected the latest available timestamp
      const maxAlert = await repositories.timeSeriesRepository
        .createQueryBuilder('time_series')
        .select('MAX(value)', 'value')
        .addSelect('source_id', 'source')
        .addSelect('MAX(timestamp)', 'timestamp')
        .where('timestamp <= :endDate::timestamp', { endDate })
        .andWhere("timestamp >= :endDate::timestamp - INTERVAL '7 days'", {
          endDate,
        })
        .andWhere('metric = :alertMetric', { alertMetric: Metric.ALERT })
        .andWhere('source_id IN (:...sourceIds)', {
          sourceIds: sources.map((source) => source.id),
        })
        .groupBy('source_id')
        .getRawMany();

      await repositories.timeSeriesRepository
        .createQueryBuilder('time_series')
        .insert()
        .values(
          maxAlert.map((data) => ({
            ...data,
            metric: Metric.WEEKLY_ALERT,
          })),
        )
        .onConflict('ON CONSTRAINT "no_duplicate_data" DO NOTHING')
        .execute();
    },
    // Concurrency is set to 1 to avoid read and writing the table time_series at the same time
    { concurrency: 1 },
  );

  // Update materialized view
  logger.log('Refreshing materialized view latest_data');
  await connection.query('REFRESH MATERIALIZED VIEW latest_data');
};
