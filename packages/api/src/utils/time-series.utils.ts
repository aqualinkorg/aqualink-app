import { IsNull, Repository } from 'typeorm';
import { Reef } from '../reefs/reefs.entity';
import { Sources, SourceType } from '../reefs/sources.entity';
import { Metric } from '../time-series/metrics.entity';
import { TimeSeries } from '../time-series/time-series.entity';

export const insertSSTToTimeSeries = async (
  reef: Reef,
  satelliteTemperature: number,
  timestamp: Date,
  timeSeriesRepository: Repository<TimeSeries>,
  sourcesRepository: Repository<Sources>,
) => {
  const sofarSource = await sourcesRepository
    .findOne({
      reef,
      type: SourceType.SOFAR_API,
      poi: IsNull(),
    })
    .then((source) => {
      if (source) {
        return source;
      }

      return sourcesRepository.save({
        reef,
        type: SourceType.SOFAR_API,
      });
    });

  await timeSeriesRepository
    .createQueryBuilder('time_series')
    .insert()
    .values({
      source: sofarSource,
      metric: Metric.SATELLITE_TEMPERATURE,
      timestamp,
      reef,
      value: satelliteTemperature,
    })
    .onConflict('ON CONSTRAINT "no_duplicate_reef_data" DO NOTHING')
    .execute();
};
