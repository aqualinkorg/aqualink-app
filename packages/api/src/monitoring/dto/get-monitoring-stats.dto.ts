import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsNumber,
  IsOptional,
  Validate,
} from 'class-validator';
import { MonitoringMetric } from 'monitoring/schemas/monitoring-metric.enum';
import { Site } from 'sites/sites.entity';
import { User } from 'users/users.entity';
import { EntityExists } from 'validations/entity-exists.constraint';

export class GetMonitoringStatsDto {
  @ApiProperty({ example: MonitoringMetric.TimeSeriesRequest })
  @IsOptional()
  @IsEnum(MonitoringMetric)
  metric?: MonitoringMetric;

  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  @Validate(EntityExists, [Site])
  siteId?: number;

  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  @Validate(EntityExists, [User])
  userId?: number;

  @ApiProperty({ example: 'SPOT-2742' })
  @Type(() => String)
  @IsOptional()
  spotterId?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  start?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  end?: Date;
}
