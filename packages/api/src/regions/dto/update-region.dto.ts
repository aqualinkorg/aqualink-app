import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  Validate,
} from 'class-validator';
import { GeoJSON } from 'geojson';
import { ApiPointProperty } from '../../docs/api-properties';
import { EntityExists } from '../../validations/entity-exists.constraint';
import { Region } from '../regions.entity';

export class UpdateRegionDto {
  @ApiProperty({ example: 'United States' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly name?: string;

  @ApiPointProperty()
  @IsOptional()
  @IsNotEmpty()
  readonly polygon?: GeoJSON;

  @ApiProperty({ example: 1 })
  @IsOptional()
  @IsInt()
  @Validate(EntityExists, [Region])
  readonly parentId?: number;
}
