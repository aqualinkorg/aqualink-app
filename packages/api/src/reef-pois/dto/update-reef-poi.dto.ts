import {
  IsNotEmpty,
  IsString,
  IsOptional,
  Validate,
  IsInt,
  IsUrl,
  IsLatitude,
  IsLongitude,
} from 'class-validator';
import { EntityExists } from '../../validations/entity-exists.constraint';
import { Reef } from '../../reefs/reefs.entity';

export class UpdateReefPoiDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly name?: string;

  @IsOptional()
  @IsLatitude()
  readonly latitude?: number;

  @IsOptional()
  @IsLongitude()
  readonly longitude?: number;

  @IsOptional()
  @IsInt()
  readonly poiLabelId?: number;

  @IsOptional()
  @IsUrl()
  readonly imageUrl?: string;

  @IsOptional()
  @IsInt()
  @Validate(EntityExists, [Reef])
  readonly reef?: Reef;
}
