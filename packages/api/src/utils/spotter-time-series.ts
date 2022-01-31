import { Logger } from '@nestjs/common';
import { inRange, mapValues, some, times } from 'lodash';
import moment from 'moment';
import { Connection, In, IsNull, Not, Repository } from 'typeorm';
import Bluebird from 'bluebird';
import { Site } from '../sites/sites.entity';
import { Sources } from '../sites/sources.entity';
import { Metric } from '../time-series/metrics.entity';
import { TimeSeries } from '../time-series/time-series.entity';
import { getSpotterData } from './sofar';
import {
  DEFAULT_SPOTTER_DATA_VALUE,
  SofarValue,
  SpotterData,
} from './sofar.types';
import { SourceType } from '../sites/schemas/source-type.enum';
import { ExclusionDates } from '../sites/exclusion-dates.entity';

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
const getSites = (siteIds: number[], siteRepository: Repository<Site>) => {
  return siteRepository.find({
    where: {
      ...(siteIds.length > 0 ? { id: In(siteIds) } : {}),
      sensorId: Not(IsNull()),
    },
  });
};

/**
 * Fetches the spotter sources based on the site.
 * If no such source exists, it creates it
 * @param sites The selected site
 * @param sourceRepository The necessary repository to perform the query
 * @returns The requested source entity
 */
const getSpotterSources = (
  sites: Site[],
  sourceRepository: Repository<Sources>,
) => {
  return sites.map((site) =>
    sourceRepository
      .findOne({
        relations: ['site'],
        where: {
          site,
          surveyPoint: IsNull(),
          type: SourceType.SPOTTER,
          sensorId: site.sensorId,
        },
      })
      .then((source) => {
        // If the source exists return it
        if (source) {
          return source;
        }

        // Else create it and return the created entity
        return sourceRepository.save({
          site,
          type: SourceType.SPOTTER,
          sensorId: site.sensorId,
        });
      }),
  );
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
 * Filters out spotter data whose timestamp falls into any exclusion date interval.
 * @param data The spotter data to filter
 * @param exclusionDates An array of exclusion dates
 * @returns The filtered spotter data
 */
const excludeSpotterData = (
  data: SpotterData,
  exclusionDates: ExclusionDates[],
) =>
  mapValues(data, (metricData) =>
    metricData?.filter(
      ({ timestamp }) =>
        // Filter data that do not belong at any `[startDate, endDate]` exclusion date interval
        !some(
          exclusionDates,
          ({ startDate: exclusionStart, endDate: exclusionEnd }) => {
            const from = exclusionStart ? moment(exclusionStart) : moment(0);
            const to = exclusionEnd ? moment(exclusionEnd) : moment();
            return inRange(
              moment(timestamp).valueOf(),
              from.valueOf(),
              to.valueOf(),
            );
          },
        ),
    ),
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
  const sites = await getSites(siteIds, repositories.siteRepository);

  logger.log('Fetching sources');
  // Fetch sources
  const spotterSources = await Promise.all(
    getSpotterSources(sites, repositories.sourceRepository),
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
      exclusionDates.map((exclusionDate) => [
        exclusionDate[0].sensorId,
        exclusionDate,
      ]),
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

          const sensorExclusionDates = sensorToExclusionDates[site.sensorId];

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
