import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsString, IsOptional } from 'class-validator';
import { WeatherConditions } from '../surveys.entity';

export class EditSurveyDto {
  @IsOptional()
  @IsDateString()
  readonly diveDate?: Date;

  @IsOptional()
  @IsEnum(WeatherConditions)
  readonly weatherConditions?: WeatherConditions;

  @ApiProperty({ example: 'Survey comments' })
  @IsOptional()
  @IsString()
  readonly comments?: string;
}
