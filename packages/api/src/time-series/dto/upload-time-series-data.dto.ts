import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsOptional } from 'class-validator';
import { SourceType } from '../../sites/schemas/source-type.enum';

export class UploadTimeSeriesDataDto {
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  failOnWarning?: boolean;

  @ApiProperty({ example: 'sonde' })
  @IsEnum(SourceType)
  sensor: SourceType;

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  siteTimezone?: boolean;
}
