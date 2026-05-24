import _, { camelCase } from 'lodash';
import { Brackets, Repository } from 'typeorm';
import { DynamicCollection } from '../collections/collections.entity';
import { CollectionDataDto } from '../collections/dto/collection-data.dto';
import { Site } from '../sites/sites.entity';
import { SourceType } from '../sites/schemas/source-type.enum';
import { LatestData } from '../time-series/latest-data.entity';
import { TimeSeries } from '../time-series/time-series.entity';

const getHistoricalCollectionData = async (
  sites: Site[],
  timeSeriesRepository: Repository<TimeSeries>,
  date: Date,
): Promise<Record<number, CollectionDataDto>> => {
  const siteIds = sites.map((site) => site.id);

  if (!siteIds.length) {
    return {};
  }

  const recentStart = new Date(date);
  recentStart.setDate(recentStart.getDate() - 7);

  const longLookbackStart = new Date(date);
  longLookbackStart.setFullYear(longLookbackStart.getFullYear() - 2);

  const historicalData = await timeSeriesRepository
    .createQueryBuilder('time_series')
    .select(
      'DISTINCT ON (time_series.metric, sources.type, sources.site_id, sources.survey_point_id) time_series.id',
      'id',
    )
    .addSelect('time_series.timestamp', 'timestamp')
    .addSelect('time_series.value', 'value')
    .addSelect('sources.site_id', 'siteId')
    .addSelect('sources.survey_point_id', 'surveyPointId')
    .addSelect('time_series.metric', 'metric')
    .addSelect('sources.type', 'source')
    .innerJoin('time_series.source', 'sources')
    .where('sources.site_id IN (:...siteIds)', { siteIds })
    .andWhere('sources.type != :hoboSource', { hoboSource: SourceType.HOBO })
    .andWhere('time_series.timestamp <= :date', { date })
    .andWhere(
      new Brackets((qb) => {
        qb.where('time_series.timestamp >= :recentStart', {
          recentStart,
        }).orWhere(
          'sources.type IN (:...longLookbackSources) AND time_series.timestamp >= :longLookbackStart',
          {
            longLookbackSources: [
              SourceType.SONDE,
              SourceType.HUI,
              SourceType.SHEET_DATA,
            ],
            longLookbackStart,
          },
        );
      }),
    )
    .orderBy('time_series.metric', 'ASC')
    .addOrderBy('sources.type', 'ASC')
    .addOrderBy('sources.site_id', 'ASC')
    .addOrderBy('sources.survey_point_id', 'ASC')
    .addOrderBy('time_series.timestamp', 'DESC')
    .getRawMany<{
      siteId: number;
      metric: string;
      value: number;
    }>();

  return _(historicalData)
    .groupBy((o) => o.siteId)
    .mapValues<CollectionDataDto>((data) =>
      data.reduce<CollectionDataDto>(
        (acc, siteData): CollectionDataDto => ({
          ...acc,
          [camelCase(siteData.metric)]: siteData.value,
        }),
        {},
      ),
    )
    .toJSON();
};

export const getCollectionData = async (
  sites: Site[],
  latestDataRepository: Repository<LatestData>,
  timeSeriesRepository?: Repository<TimeSeries>,
  date?: Date,
): Promise<Record<number, CollectionDataDto>> => {
  const siteIds = sites.map((site) => site.id);

  if (!siteIds.length) {
    return {};
  }

  if (date && timeSeriesRepository) {
    return getHistoricalCollectionData(sites, timeSeriesRepository, date);
  }

  // Get latest data
  const latestData: LatestData[] = await latestDataRepository
    .createQueryBuilder('latest_data')
    .select('id')
    .addSelect('timestamp')
    .addSelect('value')
    .addSelect('site_id', 'siteId')
    .addSelect('survey_point_id', 'surveyPointId')
    .addSelect('metric')
    .addSelect('source')
    .where('site_id IN (:...siteIds)', { siteIds })
    .andWhere('source != :hoboSource', { hoboSource: SourceType.HOBO })
    .getRawMany();

  // Map data to each site and map each site's data to the CollectionDataDto
  return _(latestData)
    .groupBy((o) => o.siteId)
    .mapValues<CollectionDataDto>((data) =>
      data.reduce<CollectionDataDto>(
        (acc, siteData): CollectionDataDto => ({
          ...acc,
          [camelCase(siteData.metric)]: siteData.value,
        }),
        {},
      ),
    )
    .toJSON();
};

export const heatStressTracker: DynamicCollection = {
  name: 'Heat Stress Tracker',
  sites: [],
  siteIds: [],
  isPublic: true,
};
