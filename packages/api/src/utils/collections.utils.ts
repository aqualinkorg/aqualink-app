import _, { camelCase } from 'lodash';
import { Repository } from 'typeorm';
import { DynamicCollection } from '../collections/collections.entity';
import { CollectionDataDto } from '../collections/dto/collection-data.dto';
import { DailyData } from '../sites/daily-data.entity';
import { Site } from '../sites/sites.entity';
import { SourceType } from '../sites/schemas/source-type.enum';
import { LatestData } from '../time-series/latest-data.entity';

const mapLatestCollectionData = (latestData: LatestData[]) =>
  _(latestData)
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

const mapDailyCollectionData = (dailyData: DailyData[]) =>
  _(dailyData)
    .groupBy((o) => o.site.id)
    .mapValues<CollectionDataDto>((data) => {
      const latest = data[0];

      return {
        dhw: latest.degreeHeatingDays ?? undefined,
        satelliteTemperature: latest.satelliteTemperature ?? undefined,
        tempAlert: latest.dailyAlertLevel ?? undefined,
        tempWeeklyAlert:
          latest.weeklyAlertLevel ?? latest.dailyAlertLevel ?? undefined,
      };
    })
    .toJSON();

export const getCollectionData = async (
  sites: Site[],
  latestDataRepository: Repository<LatestData>,
  dailyDataRepository?: Repository<DailyData>,
  date?: string | Date,
): Promise<Record<number, CollectionDataDto>> => {
  const siteIds = sites.map((site) => site.id);

  if (!siteIds.length) {
    return {};
  }

  if (date && dailyDataRepository) {
    const dailyData: DailyData[] = await dailyDataRepository
      .createQueryBuilder('daily_data')
      .distinctOn(['daily_data.site_id'])
      .select('daily_data.site_id', 'siteId')
      .addSelect('daily_data.date', 'date')
      .addSelect('daily_data.degreeHeatingDays', 'degreeHeatingDays')
      .addSelect('daily_data.satelliteTemperature', 'satelliteTemperature')
      .addSelect('daily_data.dailyAlertLevel', 'dailyAlertLevel')
      .addSelect('daily_data.weeklyAlertLevel', 'weeklyAlertLevel')
      .where('daily_data.site_id IN (:...siteIds)', { siteIds })
      .andWhere('daily_data.date <= :date', { date })
      .orderBy('daily_data.site_id', 'ASC')
      .addOrderBy('daily_data.date', 'DESC')
      .getRawMany();

    return mapDailyCollectionData(
      dailyData.map(
        (row) =>
          ({
            date: row.date,
            degreeHeatingDays: row.degreeHeatingDays,
            satelliteTemperature: row.satelliteTemperature,
            dailyAlertLevel: row.dailyAlertLevel,
            weeklyAlertLevel: row.weeklyAlertLevel,
            site: { id: row.siteId },
          }) as DailyData,
      ),
    );
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
  return mapLatestCollectionData(latestData);
};

export const heatStressTracker: DynamicCollection = {
  name: 'Heat Stress Tracker',
  sites: [],
  siteIds: [],
  isPublic: true,
};
