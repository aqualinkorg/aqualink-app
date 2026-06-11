import _, { camelCase } from 'lodash';
import { Repository } from 'typeorm';
import { DynamicCollection } from '../collections/collections.entity';
import { CollectionDataDto } from '../collections/dto/collection-data.dto';
import { DailyData } from '../sites/daily-data.entity';
import { Site } from '../sites/sites.entity';
import { SourceType } from '../sites/schemas/source-type.enum';
import { LatestData } from '../time-series/latest-data.entity';

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

export const getCollectionDataForDate = async (
  sites: Site[],
  dailyDataRepository: Repository<DailyData>,
  date: string,
): Promise<Record<number, CollectionDataDto>> => {
  const siteIds = sites.map((site) => site.id);

  if (!siteIds.length) {
    return {};
  }

  const dailyData = await dailyDataRepository
    .createQueryBuilder('daily_data')
    .leftJoin('daily_data.site', 'site')
    .select('site.id', 'siteId')
    .addSelect('daily_data.satelliteTemperature', 'satelliteTemperature')
    .addSelect('daily_data.degreeHeatingDays', 'degreeHeatingDays')
    .addSelect('daily_data.dailyAlertLevel', 'dailyAlertLevel')
    .addSelect('daily_data.weeklyAlertLevel', 'weeklyAlertLevel')
    .where('site.id IN (:...siteIds)', { siteIds })
    .andWhere('Date(daily_data.date) = Date(:date)', { date })
    .getRawMany<{
      siteId: number;
      satelliteTemperature?: number | null;
      degreeHeatingDays?: number | null;
      dailyAlertLevel?: number | null;
      weeklyAlertLevel?: number | null;
    }>();

  return _(dailyData)
    .keyBy((siteData) => siteData.siteId)
    .mapValues<CollectionDataDto>((siteData) => ({
      satelliteTemperature: siteData.satelliteTemperature ?? undefined,
      dhw:
        siteData.degreeHeatingDays != null
          ? siteData.degreeHeatingDays / 7
          : undefined,
      tempAlert: siteData.dailyAlertLevel ?? undefined,
      tempWeeklyAlert: siteData.weeklyAlertLevel ?? undefined,
    }))
    .toJSON();
};

export const heatStressTracker: DynamicCollection = {
  name: 'Heat Stress Tracker',
  sites: [],
  siteIds: [],
  isPublic: true,
};
