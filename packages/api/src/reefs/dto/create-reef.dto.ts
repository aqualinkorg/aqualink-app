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
} from 'class-validator';
import { EntityExists } from '../../validations/entity-exists.constraint';
import { User } from '../../users/users.entity';
import { VideoStream } from '../video-streams.entity';

export class CreateReefDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  readonly name: string;

  @IsLatitude()
  readonly latitude: number;

  @IsLongitude()
  readonly longitude: number;

  @IsInt()
  readonly temperatureThreshold: number;

  @IsInt()
  readonly depth: number;

  @IsOptional()
  @IsUrl()
  readonly videoStream: string;

  @IsOptional()
  @IsInt({ each: true })
  @Validate(EntityExists, [User], { each: true })
  readonly admins?: User[];

  @IsOptional()
  @IsInt()
  @Validate(EntityExists, [VideoStream])
  readonly stream?: VideoStream;
}
