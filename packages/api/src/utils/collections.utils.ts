import _, { camelCase } from 'lodash';
import { Repository } from 'typeorm';
import { DynamicCollection } from '../collections/collections.entity';
import { CollectionDataDto } from '../collections/dto/collection-data.dto';
import { Site } from '../sites/sites.entity';
import { SourceType } from '../sites/schemas/source-type.enum';
import { LatestData } from '../time-series/latest-data.entity';
import { TimeSeries } from '../time-series/time-series.entity';

export const getCollectionData = async (
  sites: Site[],
  latestDataRepository: Repository<LatestData>,
): Promise<Record<number, CollectionDataDto>> => {
  const siteIds = sites.map((site) => site.id);

  if (!siteIds.length) {
    return {};
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

export const getHistoricalCollectionData = async (
  sites: Site[],
  timeSeriesRepository: Repository<TimeSeries>,
  date: Date,
): Promise<Record<number, CollectionDataDto>> => {
  const siteIds = sites.map((site) => site.id);

  if (!siteIds.length) {
    return {};
  }

  const historicalData = await timeSeriesRepository
    .createQueryBuilder('time_series')
    .select(
      'DISTINCT ON (time_series.metric, source.type, source.site_id, source.survey_point_id) time_series.id',
    )
    .addSelect('time_series.timestamp', 'timestamp')
    .addSelect('time_series.value', 'value')
    .addSelect('source.site_id', 'siteId')
    .addSelect('source.survey_point_id', 'surveyPointId')
    .addSelect('time_series.metric', 'metric')
    .innerJoin('time_series.source', 'source')
    .where('source.site_id IN (:...siteIds)', { siteIds })
    .andWhere('source.type != :hoboSource', { hoboSource: SourceType.HOBO })
    .andWhere('time_series.timestamp <= :date', { date })
    .orderBy('time_series.metric', 'ASC')
    .addOrderBy('source.type', 'ASC')
    .addOrderBy('source.site_id', 'ASC')
    .addOrderBy('source.survey_point_id', 'ASC')
    .addOrderBy('time_series.timestamp', 'DESC')
    .getRawMany();

  return _(historicalData)
    .groupBy((data) => data.siteId)
    .mapValues<CollectionDataDto>((data) =>
      data.reduce<CollectionDataDto>(
        (acc, siteData) => ({
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
