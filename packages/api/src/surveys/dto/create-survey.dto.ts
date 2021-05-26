import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsString, IsOptional, IsDate } from 'class-validator';
import { WeatherConditions } from '../surveys.entity';

export class CreateSurveyDto {
  @Type(() => Date)
  @IsDate()
  readonly diveDate: Date;

  @IsEnum(WeatherConditions)
  readonly weatherConditions: WeatherConditions;

  @ApiProperty({ example: 'Survey comments' })
  @IsString()
  @IsOptional()
  readonly comments?: string;
}
