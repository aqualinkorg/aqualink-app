import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsString, IsOptional } from 'class-validator';
import { WeatherConditions } from '../surveys.entity';

export class CreateSurveyDto {
  @IsDateString()
  readonly diveDate: Date;

  @IsEnum(WeatherConditions)
  readonly weatherConditions: WeatherConditions;

  @ApiProperty({ example: 'Survey comments' })
  @IsString()
  @IsOptional()
  readonly comments?: string;
}
