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
import { ApiProperty } from '@nestjs/swagger';
import { EntityExists } from '../../validations/entity-exists.constraint';
import { Reef } from '../../reefs/reefs.entity';

export class UpdateReefPoiDto {
  @ApiProperty({ example: 'Updated reef point of interest name' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly name?: string;

  @ApiProperty({ example: 1.21123 })
  @IsOptional()
  @IsLatitude()
  readonly latitude?: number;

  @ApiProperty({ example: 94.22121 })
  @IsOptional()
  @IsLongitude()
  readonly longitude?: number;

  @ApiProperty({ example: 1 })
  @IsOptional()
  @IsInt()
  readonly poiLabelId?: number;

  @ApiProperty({ example: 'http://some-sample-url.com' })
  @IsOptional()
  @IsUrl()
  readonly imageUrl?: string;

  @ApiProperty({ example: 1 })
  @IsOptional()
  @IsInt()
  @Validate(EntityExists, [Reef])
  readonly reefId?: number;
}
