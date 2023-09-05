import { Logger } from '@nestjs/common';
import Bluebird from 'bluebird';
import { In, Repository } from 'typeorm';
import { Point } from 'geojson';
import { flatten, groupBy, isNil, omit, times } from 'lodash';
import { DateTime } from '../luxon-extensions';
import { Site } from '../sites/sites.entity';
import { Sources } from '../sites/sources.entity';
import { TimeSeries } from '../time-series/time-series.entity';
import { SofarModels, sofarVariableIDs } from './constants';
import { filterSofarResponse, getLatestData, sofarHindcast } from './sofar';
import {
  getNOAASource,
  insertSiteDataToTimeSeries,
  refreshMaterializedView,
} from './time-series.utils';
import { calculateAlertLevel } from './bleachingAlert';
import { getSstAnomaly } from './liveData';
import { ValueWithTimestamp } from './sofar.types';
import { Metric } from '../time-series/metrics.enum';

const MAX_SOFAR_DATE_DIFF_DAYS = 7;

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
 * @param repositories The needed repositories, as defined by the interface
 */
export const updateSST = async (
  siteIds: number[],
  days: number,
  repositories: Repositories,
) => {
  const { siteRepository, timeSeriesRepository, sourceRepository } =
    repositories;

  logger.log('Fetching sites');
  // Fetch sites entities
  const sites = await getSites(siteIds, siteRepository);

  // Fetch sources
  const sources = await Promise.all(
    sites.map((site) => {
      return getNOAASource(site, sourceRepository);
    }),
  );

  logger.log(`Back-filling ${sources.length} sites`);

  await Bluebird.map(
    sources,
    async (source) => {
      const { site } = source;
      const { polygon, nearestNOAALocation } = site;
      // Extract site coordinates
      const [NOAALongitude, NOAALatitude] = nearestNOAALocation
        ? (nearestNOAALocation as Point).coordinates
        : (polygon as Point).coordinates;

      const div = Math.floor(days / MAX_SOFAR_DATE_DIFF_DAYS);
      const mod = days % MAX_SOFAR_DATE_DIFF_DAYS;
      const intervals = [
        ...Array<number>(div).fill(MAX_SOFAR_DATE_DIFF_DAYS),
        mod,
        // remove possible zero at the end due to mod (%) operation
      ].filter((x) => x !== 0);

      const data = await Bluebird.map(
        intervals,
        async (interval, index) => {
          const endDate =
            index !== 0
              ? // subtract 1 minute to be within the api date diff limit
                DateTime.now()
                  .minus({ days: index * MAX_SOFAR_DATE_DIFF_DAYS, minutes: 1 })
                  .toString()
              : DateTime.now().minus({ minutes: 1 }).toString();
          const startDate = DateTime.now()
            .minus({ days: index * MAX_SOFAR_DATE_DIFF_DAYS })
            .toString();

          const [SofarSSTRaw, sofarDegreeHeatingWeekRaw] = await Promise.all([
            // Fetch satellite surface temperature data
            sofarHindcast(
              SofarModels.NOAACoralReefWatch,
              sofarVariableIDs[SofarModels.NOAACoralReefWatch]
                .analysedSeaSurfaceTemperature,
              NOAALatitude,
              NOAALongitude,
              startDate,
              endDate,
            ),
            // Fetch degree heating weeks data
            sofarHindcast(
              SofarModels.NOAACoralReefWatch,
              sofarVariableIDs[SofarModels.NOAACoralReefWatch]
                .degreeHeatingWeek,
              NOAALatitude,
              NOAALongitude,
              startDate,
              endDate,
            ),
          ]);

          // Filter out null values
          const sstFiltered = filterSofarResponse(SofarSSTRaw);
          const dhwFiltered = filterSofarResponse(sofarDegreeHeatingWeekRaw);

          const getDateNoTime = (x?: string) =>
            new Date(x || '').toDateString();

          const invalidDateKey = getDateNoTime(undefined);

          // Get latest dhw
          // There should be only one value for each date from sofar api
          const groupedDHWFiltered = omit(
            groupBy(dhwFiltered, (x) => getDateNoTime(x.timestamp)),
            // remove invalid date entries if any
            invalidDateKey,
          );
          const latestDhw = Object.keys(groupedDHWFiltered).map((x) =>
            getLatestData(groupedDHWFiltered[x]),
          );

          // Get alert level
          const groupedSSTFiltered = omit(
            groupBy(sstFiltered, (x) => getDateNoTime(x.timestamp)),
            // remove invalid date entries if any
            invalidDateKey,
          );
          const alertLevel = Object.keys(groupedSSTFiltered)
            .map((x) => {
              const latest = getLatestData(groupedSSTFiltered[x]);
              const dhw = latestDhw.find(
                (y) =>
                  getDateNoTime(y?.timestamp) ===
                  getDateNoTime(latest?.timestamp),
              );
              const alert = calculateAlertLevel(
                site.maxMonthlyMean,
                latest?.value,
                // Calculate degree heating days
                dhw && dhw.value * 7,
              );
              if (!alert) return undefined;
              if (!latest) return undefined;
              return {
                value: alert,
                timestamp: latest.timestamp,
              };
            })
            .filter((x): x is ValueWithTimestamp => x !== undefined);

          // Calculate the sstAnomaly
          const anomalyPerDateArray = Object.keys(groupedSSTFiltered).map(
            (x) => {
              const filtered = groupedSSTFiltered[x];
              return (
                filtered
                  .map((sst) => ({
                    value: getSstAnomaly(site.historicalMonthlyMean, sst),
                    timestamp: sst.timestamp,
                  }))
                  // Filter out null values
                  .filter(
                    (
                      sstAnomalyValue,
                    ): sstAnomalyValue is ValueWithTimestamp => {
                      return !isNil(sstAnomalyValue.value);
                    },
                  )
              );
            },
          );

          const anomaly = flatten(anomalyPerDateArray);

          const result = {
            sst: sstFiltered,
            dhw: dhwFiltered,
            sstAnomaly: anomaly,
            alert: alertLevel,
          };

          if (!result.sst.length) {
            console.error(
              `No Hindcast data available for site '${site.id}' for dates ${startDate} ${endDate}`,
            );
          }

          return result;
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
          ? DateTime.now().toString()
          : DateTime.now().minus({ days: i }).endOf('day').toString();

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
  await refreshMaterializedView(repositories.siteRepository);
};
