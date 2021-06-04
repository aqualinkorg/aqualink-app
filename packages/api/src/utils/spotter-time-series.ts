import { Logger } from '@nestjs/common';
import { times } from 'lodash';
import moment from 'moment';
import { Connection, In, IsNull, Not, Repository } from 'typeorm';
import Bluebird from 'bluebird';
import { Reef } from '../reefs/reefs.entity';
import { Sources, SourceType } from '../reefs/sources.entity';
import { Metric } from '../time-series/metrics.entity';
import { TimeSeries } from '../time-series/time-series.entity';
import { getSpotterData } from './sofar';
import {
  DEFAULT_SPOTTER_DATA_VALUE,
  SofarValue,
  SpotterData,
} from './sofar.types';

interface Repositories {
  reefRepository: Repository<Reef>;
  sourceRepository: Repository<Sources>;
  timeSeriesRepository: Repository<TimeSeries>;
}

const logger = new Logger('SpotterTimeSeries');

const getReefs = (reefIds: number[], reefRepository: Repository<Reef>) => {
  return reefRepository.find({
    where: {
      ...(reefIds.length > 0 ? { id: In(reefIds) } : {}),
      sensorId: Not(IsNull()),
    },
  });
};

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
        if (source) {
          return source;
        }

        return sourceRepository.save({
          reef,
          type: SourceType.SPOTTER,
          sensorId: reef.sensorId,
        });
      }),
  );
};

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

export const addSpotterData = async (
  reefIds: number[],
  days: number,
  connection: Connection,
  repositories: Repositories,
) => {
  logger.log('Fetching reefs');
  const reefs = await getReefs(reefIds, repositories.reefRepository);

  logger.log('Fetching sources');
  const spotterSources = await Promise.all(
    getSpotterSources(reefs, repositories.sourceRepository),
  );

  const reefToSource: Record<number, Sources> = Object.fromEntries(
    spotterSources.map((source) => [source.reef.id, source]),
  );

  logger.log('Saving spotter data');
  await Bluebird.map(
    reefs,
    (reef) =>
      Bluebird.map(
        times(days, (i) => i),
        (i) => {
          const startDate = moment().subtract(i, 'd').startOf('day').toDate();
          const endDate = moment().subtract(i, 'd').endOf('day').toDate();

          if (!reef.sensorId) {
            return DEFAULT_SPOTTER_DATA_VALUE;
          }

          return getSpotterData(reef.sensorId, endDate, startDate);
        },
        { concurrency: 100 },
      ).then((spotterData) => {
        const dataLabels: [keyof SpotterData, Metric][] = [
          ['topTemperature', Metric.TOP_TEMPERATURE],
          ['bottomTemperature', Metric.BOTTOM_TEMPERATURE],
          ['significantWaveHeight', Metric.SIGNIFICANT_WAVE_HEIGHT],
          ['waveMeanDirection', Metric.WAVE_MEAN_DIRECTION],
          ['wavePeakPeriod', Metric.WAVE_PEAK_PERIOD],
          ['windDirection', Metric.WIND_DIRECTION],
          ['windSpeed', Metric.WIND_SPEED],
        ];

        return Bluebird.each(
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
          (props, i) => {
            logger.log(
              `Saved ${i + 1} out of ${
                dataLabels.length * days
              } of daily spotter data for reef with id ${reef.id}`,
            );
          },
        );
      }),
    { concurrency: 1 },
  );

  // Update materialized view
  logger.log('Refreshing materialized view latest_data');
  await connection.query('REFRESH MATERIALIZED VIEW latest_data');
};
