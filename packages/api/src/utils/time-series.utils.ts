import { IsNull, Repository } from 'typeorm';
import { Reef } from '../reefs/reefs.entity';
import { Sources, SourceType } from '../reefs/sources.entity';
import { Metric } from '../time-series/metrics.entity';
import { TimeSeries } from '../time-series/time-series.entity';

export const getNOAASource = async (
  reef: Reef,
  sourcesRepository: Repository<Sources>,
) => {
  return sourcesRepository
    .findOne({
      where: {
        reef,
        type: SourceType.NOAA,
        poi: IsNull(),
      },
      relations: ['reef'],
    })
    .then((source) => {
      if (source) {
        return source;
      }

      return sourcesRepository.save({
        reef,
        type: SourceType.NOAA,
      });
    });
};

export const insertSSTToTimeSeries = async (
  satelliteTemperature: number,
  timestamp: Date,
  NOAASource: Sources,
  timeSeriesRepository: Repository<TimeSeries>,
) => {
  return timeSeriesRepository
    .createQueryBuilder('time_series')
    .insert()
    .values({
      source: NOAASource,
      metric: Metric.SATELLITE_TEMPERATURE,
      timestamp,
      value: satelliteTemperature,
    })
    .onConflict('ON CONSTRAINT "no_duplicate_data" DO NOTHING')
    .execute();
};
