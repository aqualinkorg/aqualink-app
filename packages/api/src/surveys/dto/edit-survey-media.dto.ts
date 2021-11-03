import {
  IsInt,
  IsOptional,
  IsBoolean,
  IsEnum,
  IsString,
  Validate,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Observations } from '../survey-media.entity';
import { EntityExists } from '../../validations/entity-exists.constraint';
import { SiteSurveyPoint } from '../../site-survey-points/site-survey-points.entity';

export class EditSurveyMediaDto {
  @IsOptional()
  @IsBoolean()
  readonly featured: boolean = false;

  @IsOptional()
  @IsBoolean()
  readonly hidden: boolean = false;

  @IsOptional()
  @IsEnum(Observations)
  readonly observations?: Observations;

  @ApiProperty({ example: 'Survey media comments' })
  @IsOptional()
  @IsString()
  readonly comments?: string;

  @ApiProperty({ example: 1 })
  @IsOptional()
  @IsInt()
  @Validate(EntityExists, [SiteSurveyPoint])
  readonly surveyPointId?: number;
}
