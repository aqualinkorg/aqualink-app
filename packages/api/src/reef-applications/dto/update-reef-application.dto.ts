import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsDateString,
  IsInt,
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

export class UpdateReefWithApplicationDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly name?: string;

  @IsOptional()
  @IsInt()
  readonly depth?: number;
}
