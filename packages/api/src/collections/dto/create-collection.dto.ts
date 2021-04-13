import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Validate,
} from 'class-validator';
import { Reef } from '../../reefs/reefs.entity';
import { User } from '../../users/users.entity';
import { EntityExists } from '../../validations/entity-exists.constraint';

export class CreateCollectionDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @IsNotEmpty()
  @IsNumber()
  @Validate(EntityExists, [User])
  userId: number;

  @IsNotEmpty()
  @IsNumber({}, { each: true })
  @Validate(EntityExists, [Reef], { each: true })
  reefIds: number[];
}
