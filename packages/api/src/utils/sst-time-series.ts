import { Logger } from '@nestjs/common';
import Bluebird from 'bluebird';
import { Connection, In, Repository } from 'typeorm';
import { Point } from 'geojson';
import { isNil, times } from 'lodash';
import moment from 'moment';

import { Reef } from '../reefs/reefs.entity';
import { Sources } from '../reefs/sources.entity';
import { TimeSeries } from '../time-series/time-series.entity';
import { SofarModels, sofarVariableIDs } from './constants';
import { filterSofarResponse, getLatestData, sofarHindcast } from './sofar';
import { getNOAASource, insertReefDataToTimeSeries } from './time-series.utils';
import { Metric } from '../time-series/metrics.entity';
import { calculateAlertLevel } from './bleachingAlert';
import { getSstAnomaly } from './liveData';
import { SofarValue } from './sofar.types';

interface Repositories {
  reefRepository: Repository<Reef>;
  sourceRepository: Repository<Sources>;
  timeSeriesRepository: Repository<TimeSeries>;
}

const logger = new Logger('SSTTimeSeries');

const getReefs = (reefIds: number[], reefRepository: Repository<Reef>) => {
  return reefRepository.find({
    where: reefIds.length > 0 ? { id: In(reefIds) } : {},
    relations: ['historicalMonthlyMean'],
  });
};

export const updateSST = async (
  reefIds: number[],
  days: number,
  connection: Connection,
  repositories: Repositories,
) => {
  const {
    reefRepository,
    timeSeriesRepository,
    sourceRepository,
  } = repositories;

  logger.log('Fetching reefs');
  const reefs = await getReefs(reefIds, reefRepository);

  const sources = await Promise.all(
    reefs.map((reef) => {
      return getNOAASource(reef, sourceRepository);
    }),
  );

  await Bluebird.map(
    sources,
    async (source) => {
      const { reef } = source;
      const point = reef.polygon as Point;
      const [longitude, latitude] = point.coordinates;

      logger.log(`Back-filling reef with id ${reef.id}.`);

      const data = await Bluebird.map(
        times(days),
        (i) => {
          const endDate =
            i === 0
              ? moment().format()
              : moment().subtract(i, 'd').endOf('day').format();
          const startDate = moment().subtract(i, 'd').startOf('day').format();

          // use Promise/then to increase concurrency since await halts the event loop
          return Promise.all([
            sofarHindcast(
              SofarModels.NOAACoralReefWatch,
              sofarVariableIDs[SofarModels.NOAACoralReefWatch]
                .analysedSeaSurfaceTemperature,
              latitude,
              longitude,
              startDate,
              endDate,
            ),
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
              reef.maxMonthlyMean,
              getLatestData(sstFiltered)?.value,
              // Calculate degree heating days
              latestDhw && latestDhw.value * 7,
            );

            const sstAnomaly = sstFiltered
              .map((sst) => ({
                value: getSstAnomaly(reef.historicalMonthlyMean, sst),
                timestamp: sst.timestamp,
              }))
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
        ({ sst, dhw, alert, sstAnomaly }) =>
          Promise.all([
            insertReefDataToTimeSeries(
              sst,
              Metric.SATELLITE_TEMPERATURE,
              source,
              timeSeriesRepository,
            ),
            insertReefDataToTimeSeries(
              dhw,
              Metric.DHW,
              source,
              timeSeriesRepository,
            ),
            insertReefDataToTimeSeries(
              alert,
              Metric.ALERT,
              source,
              timeSeriesRepository,
            ),
            insertReefDataToTimeSeries(
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
    { concurrency: days <= 5 ? 10 : 1 },
  );

  logger.log('Back-filling weekly alert level');
  await Bluebird.map(
    times(days),
    async (i) => {
      const endDate =
        i === 0
          ? moment().format()
          : moment().subtract(i, 'd').endOf('day').format();

      logger.log(`Back-filling weekly alert for ${endDate}`);
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
