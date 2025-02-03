import {
  Client,
  AddressType,
  GeocodeResult,
} from '@googlemaps/google-maps-services-js';
import {
  BadRequestException,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ObjectLiteral, Repository } from 'typeorm';
import { Dictionary, groupBy, keyBy, mapValues, merge, some } from 'lodash';
import geoTz from 'geo-tz';
import { ReefCheckSurvey } from 'reef-check-surveys/reef-check-surveys.entity';
import { Region } from '../regions/regions.entity';
import { ExclusionDates } from '../sites/exclusion-dates.entity';
import { ValueWithTimestamp, SpotterData } from './sofar.types';
import { createPoint } from './coordinates';
import { Site } from '../sites/sites.entity';
import { Sources } from '../sites/sources.entity';
import { SourceType } from '../sites/schemas/source-type.enum';
import { LatestData } from '../time-series/latest-data.entity';
import { SiteSurveyPoint } from '../site-survey-points/site-survey-points.entity';
import { getHistoricalMonthlyMeans, getMMM } from './temperature';
import { HistoricalMonthlyMean } from '../sites/historical-monthly-mean.entity';
import { Metric } from '../time-series/metrics.enum';

const googleMapsClient = new Client({});
const logger = new Logger('Site Utils');

const getLocality = (results: GeocodeResult[]) => {
  const localityPreference = [
    AddressType.administrative_area_level_2,
    AddressType.administrative_area_level_1,
    AddressType.locality,
    AddressType.country,
  ];

  if (results.length === 0) {
    return undefined;
  }

  const result = localityPreference.reduce(
    (tempResult: GeocodeResult | undefined, locality) => {
      const localityResult = results.find((r) => r.types.includes(locality));
      return tempResult || localityResult;
    },
    undefined,
  );
  return result ? result.formatted_address : results[0].formatted_address;
};

export const getGoogleRegion = async (
  longitude: number,
  latitude: number,
): Promise<string | undefined> => {
  return googleMapsClient
    .reverseGeocode({
      params: {
        latlng: [latitude, longitude],
        result_type: [AddressType.country],
        key: process.env.GOOGLE_MAPS_API_KEY || '',
      },
    })
    .then((r) => {
      const { results } = r.data;
      return getLocality(results);
    })
    .catch((e) => {
      logger.error(
        e.response
          ? e.response.data.error_message
          : 'An unknown error occurred.',
        e,
      );
      return undefined;
    });
};

export const getRegion = async (
  longitude: number,
  latitude: number,
  regionRepository: Repository<Region>,
) => {
  const country = await getGoogleRegion(longitude, latitude);
  // undefined values would result in the first database item
  // https://github.com/typeorm/typeorm/issues/2500
  const region = country
    ? await regionRepository.findOne({ where: { name: country } })
    : null;

  if (region) {
    return region;
  }

  return country
    ? regionRepository.save({
        name: country,
        polygon: createPoint(longitude, latitude),
      })
    : undefined;
};

export const getTimezones = (latitude: number, longitude: number) => {
  return geoTz(latitude, longitude);
};

export const handleDuplicateSite = (err) => {
  // Unique Violation: A site already exists at these coordinates
  if (err.code === '23505') {
    throw new BadRequestException('A site already exists at these coordinates');
  }

  logger.error('An unexpected error occurred', err);
  throw new InternalServerErrorException('An unexpected error occurred');
};

export const getExclusionDates = async (
  exclusionDatesRepository: Repository<ExclusionDates>,
  sensorId: string | null,
) => {
  if (!sensorId) {
    return [];
  }

  return exclusionDatesRepository
    .createQueryBuilder('exclusion')
    .where('exclusion.sensor_id = :sensorId', {
      sensorId,
    })
    .getMany();
};

export const getConflictingExclusionDates = async (
  exclusionDatesRepository: Repository<ExclusionDates>,
  sensorId: string,
  start: Date,
  end: Date,
) => {
  const allDates = await getExclusionDates(exclusionDatesRepository, sensorId);

  return allDates.filter(
    (exclusionDate) =>
      start <= exclusionDate.endDate &&
      (!exclusionDate.startDate || exclusionDate.startDate <= end),
  );
};

export const filterMetricDataByDate = (
  exclusionDates: ExclusionDates[],
  metricData?: ValueWithTimestamp[],
) =>
  metricData?.filter(
    ({ timestamp }) =>
      // Filter data that do not belong at any `[startDate, endDate]` exclusion date interval
      !some(exclusionDates, ({ startDate, endDate }) => {
        const dataDate = new Date(timestamp);

        return dataDate <= endDate && (!startDate || startDate <= dataDate);
      }),
  );

export const excludeSpotterData = (
  data: SpotterData,
  exclusionDates: ExclusionDates[],
) => {
  if (exclusionDates.length === 0) {
    return data;
  }

  return mapValues(data, (metricData) =>
    filterMetricDataByDate(exclusionDates, metricData),
  );
};

/**
 * Returns all columns from a Entity, including "select: false"
 * @param repository The repository of the Entity
 */
export function getAllColumns<T extends ObjectLiteral>(
  repository: Repository<T>,
): (keyof T)[] {
  return repository.metadata.columns.map(
    (col) => col.propertyName,
  ) as (keyof T)[];
}

export const getSite = async (
  siteId: number,
  siteRepository: Repository<Site>,
  relations?: string[],
  includeAll: boolean = false,
) => {
  const site = await siteRepository.findOne({
    where: { id: siteId },
    relations,
    ...(includeAll ? { select: getAllColumns(siteRepository) } : {}),
  });

  if (!site) {
    throw new NotFoundException(`Site with id ${siteId} does not exist`);
  }

  return site;
};

export const surveyPointBelongsToSite = async (
  siteId: number,
  pointId: number,
  surveyPointRepository: Repository<SiteSurveyPoint>,
) => {
  const surveyPoint = await surveyPointRepository.findOne({
    where: { id: pointId },
  });

  if (surveyPoint?.siteId?.toString() !== siteId.toString()) {
    throw new BadRequestException(
      `Survey point with id ${surveyPoint?.id} does not belong to site with id ${siteId}.`,
    );
  }
};

export const getSiteAndSurveyPoint = async (
  siteId: number,
  surveyPointId: number,
  siteRepository: Repository<Site>,
  surveyPointRepository: Repository<SiteSurveyPoint>,
) => {
  const site = await getSite(siteId, siteRepository);
  const surveyPoint = await surveyPointRepository.findOne({
    where: { id: surveyPointId },
  });

  if (!surveyPoint) {
    throw new NotFoundException(
      `Survey point with id ${surveyPointId} does not exist`,
    );
  }

  await surveyPointBelongsToSite(
    site.id,
    surveyPoint.id,
    surveyPointRepository,
  );

  return { site, surveyPoint };
};

export const getSiteFromSensorId = async (
  sensorId: string,
  siteRepository: Repository<Site>,
) => {
  const site = await siteRepository.findOne({ where: { sensorId } });

  if (!site) {
    throw new NotFoundException(`No site exists with sensor ID ${sensorId}`);
  }

  return site;
};

export const hasHoboDataSubQuery = async (
  sourceRepository: Repository<Sources>,
): Promise<Set<number>> => {
  const hasHoboData: {
    siteId: number;
  }[] = await sourceRepository
    .createQueryBuilder('sources')
    .select('site_id', 'siteId')
    .where(`type = '${SourceType.HOBO}'`)
    .groupBy('site_id')
    .getRawMany();

  const hasHoboDataSet = new Set<number>();
  hasHoboData.forEach((row) => {
    hasHoboDataSet.add(row.siteId);
  });

  return hasHoboDataSet;
};

export const getWaterQualityDataSubQuery = async (
  latestDataRepository: Repository<LatestData>,
): Promise<Map<number, string[]>> => {
  const latestData: LatestData[] = await latestDataRepository
    .createQueryBuilder('water_quality_data')
    .select('site_id', 'siteId')
    .addSelect('metric')
    .addSelect('source')
    .where(`source in ('${SourceType.HUI}', '${SourceType.SONDE}')`)
    .getRawMany();

  const sondeMetrics = [
    Metric.ODO_CONCENTRATION,
    Metric.CHOLOROPHYLL_CONCENTRATION,
    Metric.PH,
    Metric.SALINITY,
    Metric.TURBIDITY,
  ];

  const waterQualityDataSet = new Map<number, string[]>();

  Object.entries(groupBy(latestData, (o) => o.siteId)).forEach(
    ([siteId, data]) => {
      let sondeMetricsCount = 0;
      const id = Number(siteId);
      waterQualityDataSet.set(id, []);
      data.forEach((siteData) => {
        if (siteData.source === 'hui') {
          // eslint-disable-next-line fp/no-mutating-methods
          waterQualityDataSet.get(id)!.push('hui');
        }
        if (sondeMetrics.includes(siteData.metric)) {
          // eslint-disable-next-line fp/no-mutation
          sondeMetricsCount += 1;
          if (sondeMetricsCount >= 3) {
            // eslint-disable-next-line fp/no-mutating-methods
            waterQualityDataSet.get(id)!.push('sonde');
          }
        }
      });
    },
  );

  return waterQualityDataSet;
};

/**
 * Get all reef check related data like organisms and substrates spotted each site
 * This information is intented to be used to filter sites
 */
export const getReefCheckDataSubQuery = async (
  reefCheckSurveyRepository: Repository<ReefCheckSurvey>,
): Promise<
  Dictionary<{ siteId: number; organism: string[]; substrate: string[] }>
> => {
  const organisms: { siteId: number; organism: string[] }[] =
    await reefCheckSurveyRepository
      .createQueryBuilder('survey')
      .select('survey.site_id', 'siteId')
      .addSelect('json_agg(distinct rco.organism)', 'organism')
      .leftJoin('reef_check_organism', 'rco', 'rco.survey_id = survey.id')
      .where('rco.s1 > 0')
      .orWhere('rco.s2 > 0')
      .orWhere('rco.s3 > 0')
      .orWhere('rco.s4 > 0')
      .addGroupBy('survey.site_id')
      .getRawMany();

  const substrates: { siteId: number; substrate: string[] }[] =
    await reefCheckSurveyRepository
      .createQueryBuilder('survey')
      .select('survey.site_id', 'siteId')
      .addSelect('json_agg(distinct substrate_code)', 'substrate')
      .leftJoin('reef_check_substrate', 'rcs', 'survey_id = survey.id')
      .where('rcs.s1 > 0')
      .orWhere('rcs.s2 > 0')
      .orWhere('rcs.s3 > 0')
      .orWhere('rcs.s4 > 0')
      .addGroupBy('survey.site_id')
      .getRawMany();

  return merge(keyBy(organisms, 'siteId'), keyBy(substrates, 'siteId'));
};

export const getLatestData = async (
  site: Site,
  latestDataRepository: Repository<LatestData>,
): Promise<LatestData[]> => {
  return latestDataRepository.findBy({
    site: { id: site.id },
  });
};

export const createSite = async (
  name: string,
  depth: number | undefined,
  longitude: number,
  latitude: number,
  regionRepository: Repository<Region>,
  sitesRepository: Repository<Site>,
  historicalMonthlyMeanRepository: Repository<HistoricalMonthlyMean>,
): Promise<Site> => {
  const region = await getRegion(longitude, latitude, regionRepository);
  const maxMonthlyMean = await getMMM(longitude, latitude);
  const historicalMonthlyMeans = await getHistoricalMonthlyMeans(
    longitude,
    latitude,
  );
  const timezones = getTimezones(latitude, longitude) as string[];
  const site = await sitesRepository
    .save({
      name,
      region,
      polygon: createPoint(longitude, latitude),
      maxMonthlyMean,
      timezone: timezones[0],
      display: false,
      depth,
    })
    .catch(handleDuplicateSite);

  if (!maxMonthlyMean) {
    logger.warn(
      `Max Monthly Mean appears to be null for Site ${site.id} at (lat, lon): (${latitude}, ${longitude}) `,
    );
  }

  await Promise.all(
    historicalMonthlyMeans.map(async ({ month, temperature }) => {
      return (
        temperature &&
        historicalMonthlyMeanRepository.insert({
          site,
          month,
          temperature,
        })
      );
    }),
  );

  return site;
};
