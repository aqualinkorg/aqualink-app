import _, { camelCase } from 'lodash';
import { Repository } from 'typeorm';
import { DynamicCollection } from '../collections/collections.entity';
import { CollectionDataDto } from '../collections/dto/collection-data.dto';
import { DailyData } from '../sites/daily-data.entity';
import { Site } from '../sites/sites.entity';
import { SourceType } from '../sites/schemas/source-type.enum';
import { LatestData } from '../time-series/latest-data.entity';

export const mapDailyDataToCollectionDto = (
  row: Partial<DailyData> & { siteId?: number },
): CollectionDataDto => {
  const dto: CollectionDataDto = {};
  const assignIfPresent = (key: keyof CollectionDataDto, val: number | null | undefined) => {
    if (val !== null && val !== undefined) {
      dto[key] = Number(val);
    }
  };

  assignIfPresent('topTemperature', row.topTemperature);
  assignIfPresent('bottomTemperature', row.avgBottomTemperature);
  assignIfPresent('satelliteTemperature', row.satelliteTemperature);
  assignIfPresent('dhw', row.degreeHeatingDays);
  assignIfPresent('tempAlert', row.weeklyAlertLevel);
  assignIfPresent('tempWeeklyAlert', row.weeklyAlertLevel);
  assignIfPresent('windSpeed', row.avgWindSpeed);
  assignIfPresent('windDirection', row.windDirection);
  assignIfPresent('significantWaveHeight', row.avgWaveHeight);
  assignIfPresent('waveMeanDirection', row.waveMeanDirection);
  assignIfPresent('waveMeanPeriod', row.waveMeanPeriod);

  return dto;
};

export const getHistoricalCollectionData = async (
  sites: Site[],
  dailyDataRepository: Repository<DailyData>,
  date: string,
): Promise<Record<number, CollectionDataDto>> => {
  const siteIds = sites.map((site) => site.id);
  if (!siteIds.length) {
    return {};
  }

  const cutoffEndUtc = `${date.slice(0, 10)}T23:59:59.999Z`;

  const historicalRows: (DailyData & { siteId: number })[] =
    await dailyDataRepository
      .createQueryBuilder('daily_data')
      .distinctOn(['daily_data.site_id'])
      .select('daily_data.id', 'id')
      .addSelect('daily_data.date', 'date')
      .addSelect('daily_data.site_id', 'siteId')
      .addSelect('daily_data.top_temperature', 'topTemperature')
      .addSelect('daily_data.avg_bottom_temperature', 'avgBottomTemperature')
      .addSelect('daily_data.satellite_temperature', 'satelliteTemperature')
      .addSelect('daily_data.degree_heating_days', 'degreeHeatingDays')
      .addSelect('daily_data.weekly_alert_level', 'weeklyAlertLevel')
      .addSelect('daily_data.avg_wind_speed', 'avgWindSpeed')
      .addSelect('daily_data.wind_direction', 'windDirection')
      .addSelect('daily_data.avg_wave_height', 'avgWaveHeight')
      .addSelect('daily_data.wave_mean_direction', 'waveMeanDirection')
      .addSelect('daily_data.wave_mean_period', 'waveMeanPeriod')
      .where('daily_data.site_id IN (:...siteIds)', { siteIds })
      .andWhere('daily_data.date <= :cutoffEndUtc', { cutoffEndUtc })
      .orderBy('daily_data.site_id', 'ASC')
      .addOrderBy('daily_data.date', 'DESC')
      .getRawMany();

  return historicalRows.reduce<Record<number, CollectionDataDto>>((acc, row) => {
    acc[row.siteId] = mapDailyDataToCollectionDto(row);
    return acc;
  }, {});
};

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

export const heatStressTracker: DynamicCollection = {
  name: 'Heat Stress Tracker',
  sites: [],
  siteIds: [],
  isPublic: true,
};
