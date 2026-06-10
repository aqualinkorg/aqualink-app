import _, { camelCase } from 'lodash';
import { Repository } from 'typeorm';
import { DynamicCollection } from '../collections/collections.entity';
import { CollectionDataDto } from '../collections/dto/collection-data.dto';
import { Site } from '../sites/sites.entity';
import { SourceType } from '../sites/schemas/source-type.enum';
import { LatestData } from '../time-series/latest-data.entity';
import { TimeSeries } from '../time-series/time-series.entity';

interface CollectionDataOptions {
  endDate?: Date;
  startDate?: Date;
  timeSeriesRepository?: Repository<TimeSeries>;
}

type CollectionDataRow = {
  siteId: number;
  metric: string;
  value: number;
};

export const getCollectionData = async (
  sites: Site[],
  latestDataRepository: Repository<LatestData>,
  options: CollectionDataOptions = {},
): Promise<Record<number, CollectionDataDto>> => {
  const siteIds = sites.map((site) => site.id);

  if (!siteIds.length) {
    return {};
  }

  const latestData: CollectionDataRow[] =
    options.endDate && options.startDate && options.timeSeriesRepository
      ? await options.timeSeriesRepository
          .createQueryBuilder('time_series')
          .distinctOn(['source.site_id', 'time_series.metric'])
          .innerJoin('time_series.source', 'source')
          .select('source.site_id', 'siteId')
          .addSelect('time_series.metric', 'metric')
          .addSelect('time_series.value', 'value')
          .where('source.site_id IN (:...siteIds)', { siteIds })
          .andWhere('source.type != :hoboSource', {
            hoboSource: SourceType.HOBO,
          })
          .andWhere('time_series.timestamp <= :endDate', {
            endDate: options.endDate,
          })
          .andWhere('time_series.timestamp >= :startDate', {
            startDate: options.startDate,
          })
          .orderBy('source.site_id', 'ASC')
          .addOrderBy('time_series.metric', 'ASC')
          .addOrderBy('time_series.timestamp', 'DESC')
          .getRawMany()
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
