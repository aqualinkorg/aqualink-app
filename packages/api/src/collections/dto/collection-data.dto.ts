/* eslint-disable camelcase */
import { ApiProperty } from '@nestjs/swagger';
import { Metric } from '../../time-series/metrics.entity';

export class CollectionDataDto {
  @ApiProperty({ example: 28.05 })
  [Metric.BOTTOM_TEMPERATURE]?: number;

  @ApiProperty({ example: 29.05 })
  [Metric.TOP_TEMPERATURE]?: number;

  @ApiProperty({ example: 29.13 })
  [Metric.SATELLITE_TEMPERATURE]?: number;

  @ApiProperty({ example: 0 })
  [Metric.DHW]?: number;

  @ApiProperty({ example: 1 })
  [Metric.ALERT]?: number;

  @ApiProperty({ example: 1 })
  [Metric.WEEKLY_ALERT]?: number;

  @ApiProperty({ example: -0.101 })
  [Metric.SST_ANOMALY]?: number;

  @ApiProperty({ example: 1.32 })
  [Metric.SIGNIFICANT_WAVE_HEIGHT]?: number;

  @ApiProperty({ example: 2 })
  [Metric.WAVE_MEAN_DIRECTION]?: number;

  @ApiProperty({ example: 12 })
  [Metric.WAVE_MEAN_PERIOD]?: number;

  @ApiProperty({ example: 12 })
  [Metric.WAVE_PEAK_PERIOD]?: number;

  @ApiProperty({ example: 153 })
  [Metric.WIND_DIRECTION]?: number;

  @ApiProperty({ example: 10.4 })
  [Metric.WIND_SPEED]?: number;
}
