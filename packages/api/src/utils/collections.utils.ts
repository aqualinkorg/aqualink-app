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

  // As-of query: select the latest row <= the specified timestamp per site from daily_data
  const rows = await latestDataRepository.manager
    .createQueryBuilder()
    .select(`DISTINCT ON (dd.site_id) dd.site_id`, 'siteId')
    .addSelect('dd.date', 'timestamp')
    .addSelect('dd.degree_heating_days', 'degreeHeatingDays')
    .addSelect('dd.satellite_temperature', 'satelliteTemperature')
    .addSelect('dd.daily_alert_level', 'dailyAlertLevel')
    .addSelect('dd.weekly_alert_level', 'weeklyAlertLevel')
    .from('daily_data', 'dd')
    .where('dd.site_id IN (:...siteIds)', { siteIds })
    .andWhere('dd.date <= :until', { until })
    .orderBy('dd.site_id', 'ASC')
    .addOrderBy('dd.date', 'DESC')
    .getRawMany();

  return rows.reduce(
    (acc, row) => ({
      ...acc,
      [row.siteId]: {
        degreeHeatingDays: row.degreeHeatingDays,
        satelliteTemperature: row.satelliteTemperature,
        dailyAlertLevel: row.dailyAlertLevel,
        weeklyAlertLevel: row.weeklyAlertLevel,
      },
    }),
    {} as Record<number, CollectionDataDto>,
  );
};

export const heatStressTracker: DynamicCollection = {
  name: 'Heat Stress Tracker',
  sites: [],
  siteIds: [],
  isPublic: true,
};
