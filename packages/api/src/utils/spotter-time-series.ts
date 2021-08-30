import { Logger } from '@nestjs/common';
import { times } from 'lodash';
import moment from 'moment';
import { Connection, In, IsNull, Not, Repository } from 'typeorm';
import Bluebird from 'bluebird';
import { Reef } from '../reefs/reefs.entity';
import { Sources } from '../reefs/sources.entity';
import { Metric } from '../time-series/metrics.entity';
import { TimeSeries } from '../time-series/time-series.entity';
import { getSpotterData } from './sofar';
import {
  DEFAULT_SPOTTER_DATA_VALUE,
  SofarValue,
  SpotterData,
} from './sofar.types';
import { SourceType } from '../reefs/schemas/source-type.enum';

interface Repositories {
  reefRepository: Repository<Reef>;
  sourceRepository: Repository<Sources>;
  timeSeriesRepository: Repository<TimeSeries>;
}

const logger = new Logger('SpotterTimeSeries');

/**
 * Fetches all reefs with where id is included in the reefIds array and has sensorId
 * If an empty array of reefIds is given then all reefs with sensors are returned
 * @param reefIds The requested reefIds
 * @param reefRepository The required repository to make the query
 * @returns An array of reef entities
 */
const getReefs = (reefIds: number[], reefRepository: Repository<Reef>) => {
  return reefRepository.find({
    where: {
      ...(reefIds.length > 0 ? { id: In(reefIds) } : {}),
      sensorId: Not(IsNull()),
    },
  });
};

/**
 * Fetches the spotter sources based on the reef.
 * If no such source exists, it creates it
 * @param reefs The selected reef
 * @param sourceRepository The necessary repository to perform the query
 * @returns The requested source entity
 */
const getSpotterSources = (
  reefs: Reef[],
  sourceRepository: Repository<Sources>,
) => {
  return reefs.map((reef) =>
    sourceRepository
      .findOne({
        relations: ['reef'],
        where: {
          reef,
          poi: IsNull(),
          type: SourceType.SPOTTER,
          sensorId: reef.sensorId,
        },
      })
      .then((source) => {
        // If the source exists return it
        if (source) {
          return source;
        }

        // Else create it and return the created entity
        return sourceRepository.save({
          reef,
          type: SourceType.SPOTTER,
          sensorId: reef.sensorId,
        });
      }),
  );
};

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
 * @param reefIds The reefIds for which to perform the update
 * @param days How many days will this script need to backfill (1 = daily update)
 * @param connection An active typeorm connection object
 * @param repositories The needed repositories, as defined by the interface
 */
export const addSpotterData = async (
  reefIds: number[],
  days: number,
  connection: Connection,
  repositories: Repositories,
) => {
  logger.log('Fetching reefs');
  // Fetch all reefs
  const reefs = await getReefs(reefIds, repositories.reefRepository);

  logger.log('Fetching sources');
  // Fetch sources
  const spotterSources = await Promise.all(
    getSpotterSources(reefs, repositories.sourceRepository),
  );

  // Create a map from the reefIds to the source entities
  const reefToSource: Record<number, Sources> = Object.fromEntries(
    spotterSources.map((source) => [source.reef.id, source]),
  );

  logger.log('Saving spotter data');
  await Bluebird.map(
    reefs,
    (reef) =>
      Bluebird.map(
        times(days),
        (i) => {
          const startDate = moment().subtract(i, 'd').startOf('day').toDate();
          const endDate = moment().subtract(i, 'd').endOf('day').toDate();

          if (!reef.sensorId) {
            return DEFAULT_SPOTTER_DATA_VALUE;
          }

          // Fetch spotter and wave data from sofar
          return getSpotterData(reef.sensorId, endDate, startDate);
        },
        { concurrency: 100 },
      )
        .then((spotterData) => {
          const dataLabels: [keyof SpotterData, Metric][] = [
            ['topTemperature', Metric.TOP_TEMPERATURE],
            ['bottomTemperature', Metric.BOTTOM_TEMPERATURE],
            ['significantWaveHeight', Metric.SIGNIFICANT_WAVE_HEIGHT],
            ['waveMeanDirection', Metric.WAVE_MEAN_DIRECTION],
            ['wavePeakPeriod', Metric.WAVE_PEAK_PERIOD],
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
                    reefToSource[reef.id],
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
            `Spotter data updated for ${reef.sensorId} between ${startDate} and ${endDate}`,
          );
        }),
    { concurrency: 1 },
  );

  // Update materialized view
  logger.log('Refreshing materialized view latest_data');
  await connection.query('REFRESH MATERIALIZED VIEW latest_data');
};
