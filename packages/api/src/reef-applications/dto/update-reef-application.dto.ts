import {
  IsNotEmpty,
  IsString,
  IsDate,
  IsOptional,
  IsInt,
  Validate,
} from 'class-validator';
import { EntityExists } from '../../validations/entity-exists.constraint';
import { Reef } from '../../reefs/reefs.entity';
import { User } from '../../users/users.entity';

export class UpdateApplicationDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly permitRequirements?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly fundingSource?: string;

  @IsOptional()
  @IsDate()
  readonly installationSchedule?: Date;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly installationResources?: string;

  @IsOptional()
  @IsInt()
  @Validate(EntityExists, [Reef])
  readonly reefId?: number;

  @IsOptional()
  @IsInt()
  @Validate(EntityExists, [User])
  readonly userId?: number;
}
