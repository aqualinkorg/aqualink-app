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
import { EntityExists } from '../../validations/entity-exists.constraint';
import { Region } from '../../regions/regions.entity';
import { User } from '../../users/users.entity';
import { VideoStream } from '../video-streams.entity';

class Coordinates {
  @IsLatitude()
  readonly latitude: number;

  @IsLongitude()
  readonly longitude: number;
}

export class UpdateReefDto {
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

  @IsOptional()
  @IsInt()
  readonly depth?: number;

  @IsOptional()
  @IsUrl()
  readonly videoStream?: string;

  @IsOptional()
  @IsInt()
  @Validate(EntityExists, [Region])
  readonly regionId?: number;

  @IsOptional()
  @IsInt({ each: true })
  @Validate(EntityExists, [User], { each: true })
  readonly adminIds?: number[];

  @IsOptional()
  @IsInt()
  @Validate(EntityExists, [VideoStream])
  readonly streamId?: number;
}
