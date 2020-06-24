import {
  IsNotEmpty,
  IsString,
  IsOptional,
  Validate,
  MaxLength,
  IsInt,
  IsUrl,
} from 'class-validator';
import { EntityExists } from '../../validations/entity-exists.constraint';
import { Region } from '../../regions/regions.entity';
import { User } from '../../users/users.entity';
import { VideoStream } from '../video-streams.entity';

export class CreateReefDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  readonly name: string;

  @IsNotEmpty()
  readonly polygon: string;

  @IsInt()
  readonly temperatureThreshold: number;

  @IsInt()
  readonly depth: number;

  @IsInt()
  readonly status: number;

  @IsOptional()
  @IsUrl()
  readonly videoStream: string;

  @IsOptional()
  @IsInt()
  @Validate(EntityExists, [Region])
  readonly regionId?: number;

  @IsOptional()
  @IsInt()
  @Validate(EntityExists, [User])
  readonly adminId?: number;

  @IsOptional()
  @IsInt()
  @Validate(EntityExists, [VideoStream])
  readonly streamId?: number;
}
