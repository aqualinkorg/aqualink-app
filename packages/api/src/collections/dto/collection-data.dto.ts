import { ApiPropertyOptional } from '@nestjs/swagger';
import { Metric } from '../../time-series/metrics.enum';
import { KeysToCamelCase } from '../../utils/type-utils';

type MetricAsCamelcase = KeysToCamelCase<Record<Metric, number>>;

type CollectionDataDtoType = Partial<
  Pick<
    MetricAsCamelcase,
    | 'bottomTemperature'
    | 'topTemperature'
    | 'satelliteTemperature'
    | 'dhw'
    | 'tempAlert'
    | 'tempWeeklyAlert'
    | 'sstAnomaly'
    | 'significantWaveHeight'
    | 'waveMeanDirection'
    | 'waveMeanPeriod'
    | 'wavePeakPeriod'
    | 'windDirection'
    | 'windSpeed'
  >
>;

export class CollectionDataDto implements CollectionDataDtoType {
  @ApiPropertyOptional({
    description:
      'Timestamp of the daily observation the historical values were taken from. Only set for as-of date requests.',
    example: '2024-04-10T23:59:59.999Z',
  })
  observationDate?: Date;

  @ApiPropertyOptional({ example: 28.05 })
  bottomTemperature?: number;

  @ApiPropertyOptional({ example: 29.05 })
  topTemperature?: number;

  @ApiPropertyOptional({ example: 29.13 })
  satelliteTemperature?: number;

  @ApiPropertyOptional({ example: 0 })
  dhw?: number;

  @ApiPropertyOptional({ example: 1 })
  tempAlert?: number;

  @ApiPropertyOptional({ example: 1 })
  tempWeeklyAlert?: number;

  @ApiPropertyOptional({ example: -0.101 })
  sstAnomaly?: number;

  @ApiPropertyOptional({ example: 1.32 })
  significantWaveHeight?: number;

  @ApiPropertyOptional({ example: 2 })
  waveMeanDirection?: number;

  @ApiPropertyOptional({ example: 12 })
  waveMeanPeriod?: number;

  @ApiPropertyOptional({ example: 12 })
  wavePeakPeriod?: number;

  @ApiPropertyOptional({ example: 153 })
  windDirection?: number;

  @ApiPropertyOptional({ example: 10.4 })
  windSpeed?: number;
}
