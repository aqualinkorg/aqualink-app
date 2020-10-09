import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsDateString,
} from 'class-validator';

export class UpdateReefApplicationDto {
  @IsString()
  @IsNotEmpty()
  readonly permitRequirements: string;

  @IsString()
  @IsNotEmpty()
  readonly fundingSource: string;

  @IsOptional()
  @IsDateString()
  readonly installationSchedule?: Date;

  @IsString()
  @IsNotEmpty()
  readonly installationResources: string;
}
