import { camelCase, keyBy } from 'lodash';
import { In, Repository } from 'typeorm';
import { CollectionDataDto } from '../collections/dto/collection-data.dto';
import { DailyData } from '../reefs/daily-data.entity';
import { Reef } from '../reefs/reefs.entity';
import { SourceType } from '../reefs/sources.entity';
import { LatestData } from '../time-series/latest-data.entity';
import { Metric } from '../time-series/metrics.entity';
import { getSstAnomaly } from './liveData';

export interface LatestDailyData {
  // reefId
  id: number;
  date: string;
  // satelliteTemperature
  sst?: number;
  // degreeHeatingStress
  dhd?: number;
  // weekly alert
  alert?: number;
}

type MetricCamelCase =
  | 'bottomTemperature'
  | 'topTemperature'
  | 'significantWaveHeight'
  | 'waveMeanDirection'
  | 'wavePeakPeriod'
  | 'windDirection'
  | 'windSpeed';

export const getCollectionData = async (
  reefs: Reef[],
  latestDataRepository: Repository<LatestData>,
  dailyDataRepository: Repository<DailyData>,
): Promise<Record<number, CollectionDataDto>> => {
  // Get buoy data
  const latestData = await latestDataRepository.find({
    where: {
      reef: In(reefs.map((reef) => reef.id)),
      source: SourceType.SPOTTER,
      metric: In([
        Metric.BOTTOM_TEMPERATURE,
        Metric.TOP_TEMPERATURE,
        Metric.SIGNIFICANT_WAVE_HEIGHT,
        Metric.WAVE_MEAN_DIRECTION,
        Metric.WAVE_PEAK_PERIOD,
        Metric.WIND_DIRECTION,
        Metric.WIND_SPEED,
      ]),
    },
  });

  const mappedlatestData = latestData.reduce<
    Record<number, Record<MetricCamelCase, number>>
  >((acc, data) => {
    return {
      ...acc,
      [data.reefId]: {
        ...acc[data.reefId],
        [camelCase(data.metric)]: data.value,
      },
    };
  }, {});

  // Get latest sst and degree_heating days
  // Query builder doesn't apply correctly the select and DISTINCT must be first
  // So we use a raw query to achieve this
  const latestDailyData: LatestDailyData[] = await dailyDataRepository
    .createQueryBuilder('dailyData')
    .select(
      'DISTINCT ON (reef_id) reef_id AS id, satellite_temperature sst, degree_heating_days dhd, weekly_alert_level alert, date',
    )
    .where('reef_id IN (:...reefIds)', {
      reefIds: reefs.map((reef) => reef.id),
    })
    .orderBy('reef_id, date', 'DESC')
    .getRawMany();

  const mappedLatestDailyData: Record<number, LatestDailyData> = keyBy(
    latestDailyData,
    'id',
  );

  return reefs.reduce<Record<number, CollectionDataDto>>((acc, reef) => {
    const sstValue = mappedLatestDailyData[reef.id]?.sst;
    const sst =
      sstValue || sstValue === 0
        ? {
            value: sstValue,
            timestamp: mappedLatestDailyData[reef.id].date,
          }
        : undefined;

    return {
      ...acc,
      [reef.id]: {
        ...mappedlatestData[reef.id],
        satelliteTemperature: mappedLatestDailyData[reef.id]?.sst,
        degreeHeatingDays: mappedLatestDailyData[reef.id]?.dhd,
        weeklyAlertLevel: mappedLatestDailyData[reef.id]?.alert,
        sstAnomaly: getSstAnomaly(reef.historicalMonthlyMean, sst),
      },
    };
  }, {});
};
