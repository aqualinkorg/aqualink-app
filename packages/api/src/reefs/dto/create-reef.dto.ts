import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsInt,
  IsLatitude,
  IsLongitude,
  IsDateString,
} from 'class-validator';

export class CreateReefDto {
  @IsString()
  @IsNotEmpty()
  readonly name: string;

  @IsLatitude()
  readonly latitude: number;

  @IsLongitude()
  readonly longitude: number;

  @IsInt()
  readonly depth: number;
}

export class CreateReefApplicationDto {
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
}
