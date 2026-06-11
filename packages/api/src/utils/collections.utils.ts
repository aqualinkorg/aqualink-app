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
  date: string,
  timeSeriesRepository: Repository<TimeSeries>,
): Promise<Record<number, CollectionDataDto>> => {
  const siteIds = sites.map((site) => site.id);
  if (!siteIds.length) return {};

  const startOfDay = new Date(`${date}T00:00:00.000Z`);
  const endOfDay = new Date(`${date}T23:59:59.999Z`);

  // Replicate the LatestData view logic scoped to the requested date
  const rawData = await timeSeriesRepository
    .createQueryBuilder('ts')
    .select('ts.metric', 'metric')
    .addSelect('ts.value', 'value')
    .addSelect('sources.site_id', 'siteId')
    .innerJoin('sources', 'sources', 'sources.id = ts.source_id')
    .where('sources.site_id IN (:...siteIds)', { siteIds })
    .andWhere('sources.type != :hoboSource', { hoboSource: SourceType.HOBO })
    .andWhere('ts.timestamp >= :startOfDay', { startOfDay })
    .andWhere('ts.timestamp <= :endOfDay', { endOfDay })
    .orderBy('ts.metric')
    .addOrderBy('sources.type')
    .addOrderBy('sources.site_id')
    .addOrderBy('ts.timestamp', 'DESC')
    .getRawMany<{ metric: string; value: number; siteId: number }>();

  // Keep the latest value per (metric, siteId) pair within the day
  const seen = new Set<string>();
  const deduped = rawData.filter(({ metric, siteId }) => {
    const key = `${metric}-${siteId}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return _(deduped)
    .groupBy((o) => o.siteId)
    .mapValues<CollectionDataDto>((data) =>
      data.reduce<CollectionDataDto>(
        (acc, { metric, value }): CollectionDataDto => ({
          ...acc,
          [camelCase(metric)]: value,
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
