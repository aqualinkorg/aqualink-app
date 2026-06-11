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
  options?: {
    asOf?: Date;
    timeSeriesRepository?: Repository<TimeSeries>;
  },
): Promise<Record<number, CollectionDataDto>> => {
  const siteIds = sites.map((site) => site.id);

  if (!siteIds.length) {
    return {};
  }

  const asOf = options?.asOf;
  const timeSeriesRepository = options?.timeSeriesRepository;

  const weekAgo = asOf ? new Date(asOf.getTime() - 7 * 24 * 60 * 60 * 1000) : null;
  const twoYearsAgo = asOf
    ? new Date(asOf.getTime() - 2 * 365 * 24 * 60 * 60 * 1000)
    : null;

  const latestData: Array<{
    siteId: number;
    metric: string;
    value: number;
  }> =
    asOf && timeSeriesRepository
      ? await timeSeriesRepository
          .createQueryBuilder('time_series')
          .select(
            'DISTINCT ON (time_series.metric, sources.type, sources.site_id, sources.survey_point_id) time_series.id',
            'id',
          )
          .addSelect('time_series.metric', 'metric')
          .addSelect('time_series.timestamp', 'timestamp')
          .addSelect('time_series.value', 'value')
          .addSelect('sources.type', 'source')
          .addSelect('sources.site_id', 'siteId')
          .addSelect('sources.survey_point_id', 'surveyPointId')
          .innerJoin('sources', 'sources', 'sources.id = time_series.source_id')
          .where('sources.site_id IN (:...siteIds)', { siteIds })
          .andWhere('sources.type != :hoboSource', {
            hoboSource: SourceType.HOBO,
          })
          .andWhere('time_series.timestamp <= :asOf', { asOf })
          .andWhere(
            `(
              time_series.timestamp >= :weekAgo
              OR (
                sources.type IN ('sonde', 'hui', 'sheet_data')
                AND time_series.timestamp >= :twoYearsAgo
              )
            )`,
            {
              weekAgo,
              twoYearsAgo,
            },
          )
          .orderBy(
            'time_series.metric, sources.type, sources.site_id, sources.survey_point_id, time_series.timestamp',
            'DESC',
          )
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
