import {
  IsBooleanString,
  IsNumber,
  IsOptional,
  IsString,
  Validate,
} from 'class-validator';
import { Reef } from '../../reefs/reefs.entity';
import { User } from '../../users/users.entity';
import { EntityExists } from '../../validations/entity-exists.constraint';

export class FilterCollectionDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsBooleanString()
  isPublic?: string;

  @IsOptional()
  @IsNumber()
  @Validate(EntityExists, [User])
  userId?: number;

  @IsOptional()
  @IsNumber()
  @Validate(EntityExists, [Reef])
  reefId?: number;
}
