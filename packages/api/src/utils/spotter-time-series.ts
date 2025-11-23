import { Logger } from '@nestjs/common';
import { get, times } from 'lodash';
import { In, IsNull, Not, Repository } from 'typeorm';
import pLimit from 'p-limit';
import { distance } from '@turf/turf';
import { Point } from 'geojson';
import { DateTime } from '../luxon-extensions';
import { Site } from '../sites/sites.entity';
import { Sources } from '../sites/sources.entity';
import { TimeSeries } from '../time-series/time-series.entity';
import { getSpotterData } from './sofar';
import {
  DEFAULT_SPOTTER_DATA_VALUE,
  ValueWithTimestamp,
  SpotterData,
} from './sofar.types';
import { SourceType } from '../sites/schemas/source-type.enum';
import { ExclusionDates } from '../sites/exclusion-dates.entity';
import { excludeSpotterData } from './site.utils';
import { getSources, refreshMaterializedView } from './time-series.utils';
import { Metric } from '../time-series/metrics.enum';

const MAX_DISTANCE_FROM_SITE = 50;

interface Repositories {
  siteRepository: Repository<Site>;
  sourceRepository: Repository<Sources>;
  timeSeriesRepository: Repository<TimeSeries>;
  exclusionDatesRepository: Repository<ExclusionDates>;
}

const logger = new Logger('SpotterTimeSeries');

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
    exclusionDatesRepository.find({
      where: {
        sensorId: source.sensorId ?? IsNull(),
      },
    }),
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
  batch: ValueWithTimestamp[],
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
        timestamp: DateTime.fromISO(data.timestamp)
          .startOf('minute')
          .toJSDate(),
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
 * @param repositories The needed repositories, as defined by the interface
 */
export const addSpotterData = async (
  siteIds: number[],
  days: number,
  repositories: Repositories,
  skipDistanceCheck = false,
) => {
  logger.log('Fetching sites');
  // Fetch all sites
  const sites = await repositories.siteRepository.find({
    where: {
      ...(siteIds.length > 0 ? { id: In(siteIds) } : {}),
      sensorId: Not(IsNull()),
    },
    select: ['id', 'sensorId', 'spotterApiToken', 'polygon'],
  });

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
  const outerLimit = pLimit(1);
  await Promise.all(
    sites.map((site) =>
      outerLimit(async () => {
        const innerLimit = pLimit(100);
        const spotterData = await Promise.all(
          times(days).map((i) =>
            innerLimit(async () => {
              const startDate = DateTime.now()
                .minus({ days: i })
                .startOf('day')
                .toJSDate();
              const endDate = DateTime.now()
                .minus({ days: i })
                .endOf('day')
                .toJSDate();

              if (!site.sensorId) {
                return DEFAULT_SPOTTER_DATA_VALUE;
              }

              const sensorExclusionDates = get(
                sensorToExclusionDates,
                site.sensorId,
                [],
              );

              const sofarToken =
                site.spotterApiToken || process.env.SOFAR_API_TOKEN;
              // Fetch spotter and wave data from sofar
              const data = await getSpotterData(
                site.sensorId,
                sofarToken,
                endDate,
                startDate,
              ).then((rawSpotterData) =>
                excludeSpotterData(rawSpotterData, sensorExclusionDates),
              );

              if (
                !skipDistanceCheck &&
                data?.latitude?.length &&
                data?.longitude?.length
              ) {
                // Check if spotter is within specified distance from its site, else don't return any data.
                const dist = distance(
                  (site.polygon as Point).coordinates,
                  [data.longitude[0].value, data.latitude[0].value],
                  { units: 'kilometers' },
                );
                if (dist > MAX_DISTANCE_FROM_SITE) {
                  logger.warn(
                    `Spotter is over ${MAX_DISTANCE_FROM_SITE}km from site ${site.id}. Data will not be saved.`,
                  );
                  return DEFAULT_SPOTTER_DATA_VALUE;
                }
              }

              return data;
            }),
          ),
        );

        const dataLabels: [keyof SpotterData, Metric][] = [
          ['topTemperature', Metric.TOP_TEMPERATURE],
          ['bottomTemperature', Metric.BOTTOM_TEMPERATURE],
          ['significantWaveHeight', Metric.SIGNIFICANT_WAVE_HEIGHT],
          ['waveMeanDirection', Metric.WAVE_MEAN_DIRECTION],
          ['waveMeanPeriod', Metric.WAVE_MEAN_PERIOD],
          ['windDirection', Metric.WIND_DIRECTION],
          ['windSpeed', Metric.WIND_SPEED],
          ['barometerTop', Metric.BAROMETRIC_PRESSURE_TOP],
          ['barometerBottom', Metric.BAROMETRIC_PRESSURE_BOTTOM],
          ['barometricTopDiff', Metric.BAROMETRIC_PRESSURE_TOP_DIFF],
          ['surfaceTemperature', Metric.SURFACE_TEMPERATURE],
        ];

        // Save data to time_series
        await Promise.all(
          spotterData
            .map((dailySpotterData) =>
              dataLabels.map(([spotterDataLabel, metric]) =>
                saveDataBatch(
                  dailySpotterData[spotterDataLabel] as ValueWithTimestamp[], // We know that there would not be any undefined values here
                  siteToSource[site.id],
                  metric,
                  repositories.timeSeriesRepository,
                ),
              ),
            )
            .flat(),
        );

        // After each successful execution, log the event
        const startDate = DateTime.now()
          .minus({ days: days - 1 })
          .startOf('day');

        const endDate = DateTime.now().endOf('day');
        logger.debug(
          `Spotter data updated for ${site.sensorId} between ${startDate} and ${endDate}`,
        );
      }),
    ),
  );

  // Update materialized view
  await refreshMaterializedView(repositories.siteRepository);
};
