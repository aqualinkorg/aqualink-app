import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  Validate,
} from 'class-validator';
import { Reef } from '../../reefs/reefs.entity';
import { User } from '../../users/users.entity';
import { EntityExists } from '../../validations/entity-exists.constraint';

export class UpdateCollectionDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @IsOptional()
  @IsNumber()
  @Validate(EntityExists, [User])
  userId?: number;

  @IsOptional()
  @IsNumber({}, { each: true })
  @Validate(EntityExists, [Reef], { each: true })
  reefIds?: number[];
}
