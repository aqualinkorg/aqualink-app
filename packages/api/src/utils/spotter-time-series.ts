import { Logger } from '@nestjs/common';
import { get, times } from 'lodash';
import { In, IsNull, Not, Repository } from 'typeorm';
import Bluebird from 'bluebird';
import { distance } from '@turf/turf';
import { Point } from 'geojson';
import { Site } from '../sites/sites.entity';
import { Sources } from '../sites/sources.entity';
import { TimeSeries } from '../time-series/time-series.entity';
import { DateTime } from '../luxon-extensions';
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
import { extractSeapHoxFromSofarData, SeapHOxData } from './seaphox-decoder';

const MAX_DISTANCE_FROM_SITE = 50;

interface Repositories {
  siteRepository: Repository<Site>;
  sourceRepository: Repository<Sources>;
  timeSeriesRepository: Repository<TimeSeries>;
  exclusionDatesRepository: Repository<ExclusionDates>;
}

const logger = new Logger('SpotterTimeSeries');

/**
 * Check if site already has SeapHOx data in time_series table
 * Used to determine if we need to backfill 90 days or just fetch recent data
 */
const hasExistingSeapHOxData = async (
  siteId: number,
  timeSeriesRepository: Repository<TimeSeries>,
): Promise<boolean> => {
  const count = await timeSeriesRepository.count({
    where: {
      source: { site: { id: siteId }, type: SourceType.SEAPHOX },
      metric: Metric.PH,
    },
    take: 1,
  });
  return count > 0;
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
) =>
  // TODO - Filter out nil values
  timeSeriesRepository
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
    select: ['id', 'sensorId', 'spotterApiToken', 'polygon', 'hasSeaphox'],
  });

  logger.log('Fetching sources');
  // Fetch sources
  const spotterSources = await Promise.all(
    getSources(sites, SourceType.SPOTTER, repositories.sourceRepository),
  );

  // Fetch SeapHOx sources for sites that have SeapHOx
  const seaphoxSites = sites.filter((site) => site.hasSeaphox);
  const seaphoxSources = await Promise.all(
    seaphoxSites.length > 0
      ? getSources(seaphoxSites, SourceType.SEAPHOX, repositories.sourceRepository)
      : [],
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

  // Create a map from siteIds to SeapHOx source entities
  const siteToSeaphoxSource: Record<number, Sources> = Object.fromEntries(
    seaphoxSources.map((source) => [source.site.id, source]),
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
    async (site) => {
      // Fetch 90 days for NEW SeapHOx sites (first run only)
      // After first run, just fetch recent data like normal spotters
      const hasSeapHOxData = site.hasSeaphox
        ? await hasExistingSeapHOxData(
            site.id,
            repositories.timeSeriesRepository,
          )
        : false;

      const daysToFetch =
        site.hasSeaphox && !hasSeapHOxData ? Math.max(days, 90) : days;

      return Bluebird.map(
        times(daysToFetch),
        async (i) => {
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
          const spotterData = await getSpotterData(
            site.sensorId,
            sofarToken,
            endDate,
            startDate,
            site.hasSeaphox,
          ).then((data) => excludeSpotterData(data, sensorExclusionDates));

          if (
            !skipDistanceCheck &&
            spotterData?.latitude?.length &&
            spotterData?.longitude?.length
          ) {
            // Check if spotter is within specified distance from its site, else don't return any data.
            const dist = distance(
              (site.polygon as Point).coordinates,
              [spotterData.longitude[0].value, spotterData.latitude[0].value],
              { units: 'kilometers' },
            );
            if (dist > MAX_DISTANCE_FROM_SITE) {
              logger.warn(
                `Spotter is over ${MAX_DISTANCE_FROM_SITE}km from site ${site.id}. Data will not be saved.`,
              );
              return DEFAULT_SPOTTER_DATA_VALUE;
            }
          }

          return spotterData;
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
            ['barometerTop', Metric.BAROMETRIC_PRESSURE_TOP],
            ['barometerBottom', Metric.BAROMETRIC_PRESSURE_BOTTOM],
            ['barometricTopDiff', Metric.BAROMETRIC_PRESSURE_TOP_DIFF],
            ['surfaceTemperature', Metric.SURFACE_TEMPERATURE],
          ];

          // Save standard spotter data to time_series
          const spotterPromises = spotterData
            .map((dailySpotterData) =>
              dataLabels.map(([spotterDataLabel, metric]) =>
                saveDataBatch(
                  dailySpotterData[spotterDataLabel] as ValueWithTimestamp[],
                  siteToSource[site.id],
                  metric,
                  repositories.timeSeriesRepository,
                ),
              ),
            )
            .flat();

          // Process SeapHOx data if site has it
          let seaphoxPromises: Promise<any>[] = [];

          if (site.hasSeaphox) {
            // Extract SeapHOx data from all daily spotter data
            const allSeaphoxData = spotterData
              .map((dailySpotterData) =>
                extractSeapHoxFromSofarData(dailySpotterData.raw || []),
              )
              .flat();

            if (allSeaphoxData.length > 0) {
              logger.debug(
                `Found ${allSeaphoxData.length} SeapHOx data points for site ${site.id}`,
              );

              const seaphoxMetrics: Array<[keyof SeapHOxData, Metric]> = [
                ['temperature', Metric.BOTTOM_TEMPERATURE],
                ['externalPh', Metric.PH],
                ['internalPh', Metric.INTERNAL_PH],
                ['externalPhVolt', Metric.EXTERNAL_PH_VOLT],
                ['internalPhVolt', Metric.INTERNAL_PH_VOLT],
                ['phTemperature', Metric.PH_TEMPERATURE],
                ['pressure', Metric.PRESSURE],
                ['salinity', Metric.SALINITY],
                ['conductivity', Metric.CONDUCTIVITY],
                ['oxygen', Metric.DISSOLVED_OXYGEN],
                ['relativeHumidity', Metric.RELATIVE_HUMIDITY],
                ['intTemperature', Metric.INTERNAL_TEMPERATURE],
                ['sampleNumber', Metric.SAMPLE_NUMBER],
                ['errorFlags', Metric.ERROR_FLAGS],
              ];

              // eslint-disable-next-line fp/no-mutation
              seaphoxPromises = seaphoxMetrics.map(([field, metric]) => {
                // Filter out null values and ensure we have valid numbers
                const values: ValueWithTimestamp[] = allSeaphoxData
                  .filter((data) => {
                    const value = data[field];
                    return (
                      value !== null &&
                      typeof value === 'number' &&
                      !Number.isNaN(value)
                    );
                  })
                  .map((data) => ({
                    value: data[field] as number, // Safe cast since we filtered above
                    timestamp: data.timestamp,
                  }));

                if (values.length > 0) {
                  // Use SeapHOx source instead of spotter source
                  const seaphoxSource = siteToSeaphoxSource[site.id];
                  if (!seaphoxSource) {
                    logger.warn(
                      `No SeapHOx source found for site ${site.id}, skipping SeapHOx data`,
                    );
                    return Promise.resolve();
                  }
                  return saveDataBatch(
                    values,
                    seaphoxSource,
                    metric,
                    repositories.timeSeriesRepository,
                  );
                }
                return Promise.resolve();
              });
            }
          }

          // Save both standard Spotter and SeapHOx data
          return Promise.all([...spotterPromises, ...seaphoxPromises]);
        })
        .then(() => {
          // After each successful execution, log the event
          const startDate = DateTime.now()
            .minus({ days: daysToFetch - 1 })
            .startOf('day');

          const endDate = DateTime.now().endOf('day');
          logger.debug(
            `Spotter data updated for ${site.sensorId} between ${startDate} and ${endDate}`,
          );
        });
    },
    { concurrency: 1 },
  );

  // Update materialized view
  await refreshMaterializedView(repositories.siteRepository);
};
