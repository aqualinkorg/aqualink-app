import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsString, IsOptional, IsDate } from 'class-validator';
import { WeatherConditions } from '../surveys.entity';

export class EditSurveyDto {
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  readonly diveDate?: Date;

  @IsOptional()
  @IsEnum(WeatherConditions)
  readonly weatherConditions?: WeatherConditions;

  @ApiProperty({ example: 'Survey comments' })
  @IsOptional()
  @IsString()
  readonly comments?: string;
}
