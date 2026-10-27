import _, { camelCase } from 'lodash';
import { Repository } from 'typeorm';
import { DynamicCollection } from '../collections/collections.entity';
import { CollectionDataDto } from '../collections/dto/collection-data.dto';
import { Site } from '../sites/sites.entity';
import { SourceType } from '../sites/schemas/source-type.enum';
import { LatestData } from '../time-series/latest-data.entity';
import { getHistoricalData, historicalDateBounds } from './historical-data';

export const getCollectionData = async (
  sites: Site[],
  latestDataRepository: Repository<LatestData>,
  asOf?: string,
): Promise<Record<number, CollectionDataDto>> => {
  if (asOf) historicalDateBounds(asOf);
  const siteIds = sites.map((site) => site.id);

  if (!siteIds.length) {
    return {};
  }

  // Get latest data
  const latestData: LatestData[] = asOf
    ? (await getHistoricalData(siteIds, latestDataRepository, asOf)).filter(
        (data) => data.source !== SourceType.HOBO,
      )
    : await latestDataRepository
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
