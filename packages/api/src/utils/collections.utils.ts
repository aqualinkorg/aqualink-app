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
  date?: string,
): Promise<Record<number, CollectionDataDto>> => {
  const siteIds = sites.map((site) => site.id);

  if (!siteIds.length) {
    return {};
  }

  if (date) {
    // For historical dates, query time_series data closest to the requested date
    // We look for data within a 24-hour window around the requested date
    const startDate = `${date}T00:00:00Z`;
    const endDate = `${date}T23:59:59Z`;

    const historicalData = await latestDataRepository.manager.query(
      `SELECT DISTINCT ON (site_id, metric)
        id, timestamp, value, site_id as "siteId",
        survey_point_id as "surveyPointId", metric, source
      FROM time_series
      WHERE site_id = ANY($1)
        AND source != $2
        AND timestamp >= $3
        AND timestamp <= $4
      ORDER BY site_id, metric, timestamp DESC`,
      [siteIds, SourceType.HOBO, startDate, endDate],
    );

    return _(historicalData)
      .groupBy((o: any) => o.siteId)
      .mapValues<CollectionDataDto>((data: any[]) =>
        data.reduce<CollectionDataDto>(
          (acc, siteData): CollectionDataDto => ({
            ...acc,
            [camelCase(siteData.metric)]: siteData.value,
          }),
          {},
        ),
      )
      .toJSON();
  }

  // Get latest data (default behavior)
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
