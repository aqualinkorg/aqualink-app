import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsInt,
  Validate,
  IsDateString,
} from 'class-validator';
import { EntityExists } from '../../validations/entity-exists.constraint';
import { Reef } from '../../reefs/reefs.entity';
import { User } from '../../users/users.entity';

export class UpdateReefApplicationDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly permitRequirements?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly fundingSource?: string;

  @IsOptional()
  @IsDateString()
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
