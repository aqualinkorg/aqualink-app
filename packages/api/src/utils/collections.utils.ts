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
  atDate?: Date,
): Promise<Record<number, CollectionDataDto>> => {
  const siteIds = sites.map((site) => site.id);

  if (!siteIds.length) {
    return {};
  }

  if (atDate) {
    const dailyData = await latestDataRepository.manager
      .createQueryBuilder()
      .select('DISTINCT ON (daily_data.site_id) daily_data.site_id', 'siteId')
      .addSelect('daily_data.degree_heating_days', 'degreeHeatingDays')
      .addSelect('daily_data.satellite_temperature', 'satelliteTemperature')
      .addSelect('daily_data.daily_alert_level', 'dailyAlertLevel')
      .addSelect('daily_data.weekly_alert_level', 'weeklyAlertLevel')
      .from('daily_data', 'daily_data')
      .where('daily_data.site_id IN (:...siteIds)', { siteIds })
      .andWhere('daily_data.date <= :atDate', {
        atDate: atDate.toISOString(),
      })
      .orderBy('daily_data.site_id')
      .addOrderBy('daily_data.date', 'DESC')
      .getRawMany();

    return _(dailyData)
      .groupBy((o) => Number(o.siteId))
      .mapValues<CollectionDataDto>((rows) => {
        const row = rows[0];
        return {
          ...(row?.degreeHeatingDays !== null
            ? { dhw: Number(row.degreeHeatingDays) }
            : {}),
          ...(row?.satelliteTemperature !== null
            ? { satelliteTemperature: Number(row.satelliteTemperature) }
            : {}),
          ...(row?.dailyAlertLevel !== null
            ? { tempAlert: Number(row.dailyAlertLevel) }
            : {}),
          ...(row?.weeklyAlertLevel !== null
            ? { tempWeeklyAlert: Number(row.weeklyAlertLevel) }
            : {}),
        };
      })
      .toJSON();
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
