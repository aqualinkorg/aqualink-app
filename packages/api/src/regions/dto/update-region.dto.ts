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
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly name?: string;

  @ApiPointProperty()
  @IsOptional()
  @IsNotEmpty()
  readonly polygon?: GeoJSON;

  @IsOptional()
  @IsInt()
  @Validate(EntityExists, [Region])
  readonly parentId?: number;
}
