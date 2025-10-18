import _, { camelCase } from 'lodash';
import { Repository } from 'typeorm';
import { DynamicCollection } from '../collections/collections.entity';
import { CollectionDataDto } from '../collections/dto/collection-data.dto';
import { Site } from '../sites/sites.entity';
import { SourceType } from '../sites/schemas/source-type.enum';
import { LatestData } from '../time-series/latest-data.entity';

export const getCollectionData = async (
  sites: Site[],
  latestDataRepository: Repository<LatestData>,
  options?: { at?: Date },
): Promise<Record<number, CollectionDataDto>> => {
  const siteIds = sites.map((site) => site.id);

  if (!siteIds.length) {
    return {};
  }

  // If an "at" date is provided, query time_series historical data at that timestamp;
  // otherwise, use the materialized latest_data view for performance.
  const until = options?.at;

  if (!until) {
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

    return _(latestData)
      .groupBy((o) => o.siteId)
      .mapValues<CollectionDataDto>((data) =>
        data.reduce<CollectionDataDto>((acc, siteData): CollectionDataDto => {
          return {
            ...acc,
            [camelCase(siteData.metric)]: siteData.value,
          };
        }, {}),
      )
      .toJSON();
  }

  // As-of query: select the latest row <= the specified timestamp per (site, metric, source type excluding HOBO)
  // using DISTINCT ON ordering by timestamp DESC.
  // We join to sources to filter out HOBO and group by site id.
  const rows = await latestDataRepository.manager
    .createQueryBuilder()
    .select(`DISTINCT ON (ts.metric, src.type, src.site_id) ts.id`)
    .addSelect('ts.timestamp', 'timestamp')
    .addSelect('ts.value', 'value')
    .addSelect('src.site_id', 'siteId')
    .addSelect('ts.metric', 'metric')
    .addSelect('src.type', 'source')
    .from('time_series', 'ts')
    .innerJoin('sources', 'src', 'src.id = ts.source_id')
    .where('src.site_id IN (:...siteIds)', { siteIds })
    .andWhere('src.type != :hoboSource', { hoboSource: SourceType.HOBO })
    .andWhere('ts.timestamp <= :until', { until })
    .orderBy('ts.metric, src.type, src.site_id, ts.timestamp', 'DESC')
    .getRawMany();

  return _(rows)
    .groupBy((o) => o.siteId)
    .mapValues<CollectionDataDto>((data) =>
      data.reduce<CollectionDataDto>((acc, siteData): CollectionDataDto => {
        return {
          ...acc,
          [camelCase(siteData.metric)]: siteData.value,
        };
      }, {}),
    )
    .toJSON();
};

export const heatStressTracker: DynamicCollection = {
  name: 'Heat Stress Tracker',
  sites: [],
  siteIds: [],
  isPublic: true,
};
