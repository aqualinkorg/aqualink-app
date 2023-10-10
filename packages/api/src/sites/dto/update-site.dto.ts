import {
  IsNotEmpty,
  IsString,
  IsOptional,
  Validate,
  MaxLength,
  IsInt,
  IsUrl,
  IsLatitude,
  IsLongitude,
  IsObject,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { EntityExists } from '../../validations/entity-exists.constraint';
import { Region } from '../../regions/regions.entity';
import { User } from '../../users/users.entity';
import { VideoStream } from '../video-streams.entity';

class Coordinates {
  @ApiProperty({ example: 15.5416 })
  @IsLatitude()
  readonly latitude: number;

  @ApiProperty({ example: -1.456 })
  @IsLongitude()
  readonly longitude: number;
}

export class UpdateSiteDto {
  @ApiProperty({ example: 'Duxbury Site' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  readonly name?: string;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => Coordinates)
  readonly coordinates?: Coordinates;

  @ApiProperty({ example: 81 })
  @IsOptional()
  @IsInt()
  readonly depth?: number;

  @IsOptional()
  @IsUrl()
  readonly videoStream?: string;

  @ApiProperty({ example: 1 })
  @IsOptional()
  @IsInt()
  @Validate(EntityExists, [Region])
  readonly regionId?: number;

  @ApiProperty({ example: [1, 2, 3] })
  @IsOptional()
  @IsInt({ each: true })
  @Validate(EntityExists, [User], { each: true })
  readonly adminIds?: number[];

  @ApiProperty({ example: 1 })
  @IsOptional()
  @IsInt()
  @Validate(EntityExists, [VideoStream])
  readonly streamId?: number;

  @ApiProperty({ example: 'SPOT-1742' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  readonly sensorId?: string;

  @ApiProperty({ example: 'jl3Xr1kZeqDqs7KAiktXOyr3PlB5Ip' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  readonly spotterApiToken?: string | null;
}
