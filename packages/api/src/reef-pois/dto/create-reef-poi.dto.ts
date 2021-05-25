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

export class CreateReefPoiDto {
  @ApiProperty({ example: 'Outer tide pool' })
  @IsString()
  @IsNotEmpty()
  readonly name: string;

  @ApiProperty({ example: 12.4344 })
  @IsOptional()
  @IsLatitude()
  readonly latitude?: number;

  @ApiProperty({ example: -21.2233 })
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

  @ApiProperty({ example: 2 })
  @IsInt()
  @Validate(EntityExists, [Reef])
  readonly reefId: number;
}
