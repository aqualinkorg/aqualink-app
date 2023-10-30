import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsDate, IsNumber, IsOptional, Validate } from 'class-validator';
import { Site } from 'sites/sites.entity';
import { EntityExists } from 'validations/entity-exists.constraint';

export class GetMonitoringStatsDto {
  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  @Validate(EntityExists, [Site])
  siteId?: number;

  @ApiProperty({ example: 'SPOT-2742' })
  @Type(() => String)
  @IsOptional()
  spotterId?: string;

  @IsOptional()
  @Transform(({ value }) => {
    return [true, 'true', 1, '1'].indexOf(value) > -1;
  })
  monthly?: boolean;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  start?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  end?: Date;
}
