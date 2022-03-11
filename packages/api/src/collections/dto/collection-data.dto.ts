/* eslint-disable camelcase */
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Metric } from '../../time-series/metrics.entity';

export class CollectionDataDto {
  @ApiPropertyOptional({ example: 28.05 })
  [Metric.BOTTOM_TEMPERATURE]?: number;

  @ApiPropertyOptional({ example: 29.05 })
  [Metric.TOP_TEMPERATURE]?: number;

  @ApiPropertyOptional({ example: 29.13 })
  [Metric.SATELLITE_TEMPERATURE]?: number;

  @ApiPropertyOptional({ example: 0 })
  [Metric.DHW]?: number;

  @ApiPropertyOptional({ example: 1 })
  [Metric.ALERT]?: number;

  @ApiPropertyOptional({ example: 1 })
  [Metric.WEEKLY_ALERT]?: number;

  @ApiPropertyOptional({ example: -0.101 })
  [Metric.SST_ANOMALY]?: number;

  @ApiPropertyOptional({ example: 1.32 })
  [Metric.SIGNIFICANT_WAVE_HEIGHT]?: number;

  @ApiPropertyOptional({ example: 2 })
  [Metric.WAVE_MEAN_DIRECTION]?: number;

  @ApiPropertyOptional({ example: 12 })
  [Metric.WAVE_MEAN_PERIOD]?: number;

  @ApiPropertyOptional({ example: 12 })
  [Metric.WAVE_PEAK_PERIOD]?: number;

  @ApiPropertyOptional({ example: 153 })
  [Metric.WIND_DIRECTION]?: number;

  @ApiPropertyOptional({ example: 10.4 })
  [Metric.WIND_SPEED]?: number;
}
