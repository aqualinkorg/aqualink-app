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

type NullableCollectionDataDtoType = {
  [K in keyof CollectionDataDtoType]: CollectionDataDtoType[K] | null;
};

export class CollectionDataDto implements NullableCollectionDataDtoType {
  @ApiPropertyOptional({ example: 28.05 })
  bottomTemperature?: number | null;

  @ApiPropertyOptional({ example: 29.05 })
  topTemperature?: number | null;

  @ApiPropertyOptional({ example: 29.13 })
  satelliteTemperature?: number | null;

  @ApiPropertyOptional({ example: 0 })
  dhw?: number | null;

  @ApiPropertyOptional({ example: 1 })
  tempAlert?: number | null;

  @ApiPropertyOptional({ example: 1 })
  tempWeeklyAlert?: number | null;

  @ApiPropertyOptional({ example: -0.101 })
  sstAnomaly?: number | null;

  @ApiPropertyOptional({ example: 1.32 })
  significantWaveHeight?: number | null;

  @ApiPropertyOptional({ example: 2 })
  waveMeanDirection?: number | null;

  @ApiPropertyOptional({ example: 12 })
  waveMeanPeriod?: number | null;

  @ApiPropertyOptional({ example: 12 })
  wavePeakPeriod?: number | null;

  @ApiPropertyOptional({ example: 153 })
  windDirection?: number | null;

  @ApiPropertyOptional({ example: 10.4 })
  windSpeed?: number | null;
}
