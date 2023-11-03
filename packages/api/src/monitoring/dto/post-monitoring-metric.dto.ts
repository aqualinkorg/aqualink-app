import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsNumber, Validate } from 'class-validator';
import { MonitoringMetric } from 'monitoring/schemas/monitoring-metric.enum';
import { Site } from 'sites/sites.entity';
import { EntityExists } from 'validations/entity-exists.constraint';

export class PostMonitoringMetricDto {
  @ApiProperty({ example: MonitoringMetric.TimeSeriesRequest })
  @IsEnum(MonitoringMetric)
  metric: MonitoringMetric;

  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsNumber()
  @Validate(EntityExists, [Site])
  siteId: number;
}
