import {
  IsDateString,
  IsEnum,
  IsString,
  IsOptional,
  IsInt,
  Validate,
} from 'class-validator';
import { WeatherConditions } from '../surveys.entity';
import { EntityExists } from '../../validations/entity-exists.constraint';
import { Reef } from '../../reefs/reefs.entity';

export class CreateSurveyDto {
  @IsDateString()
  readonly diveDate: Date;

  @IsEnum(WeatherConditions)
  readonly weatherConditions: WeatherConditions;

  @IsString()
  @IsOptional()
  readonly comments: string;

  @IsInt()
  @Validate(EntityExists, [Reef])
  readonly reef: Reef;
}
