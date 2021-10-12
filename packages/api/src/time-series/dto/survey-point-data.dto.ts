import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, Validate } from 'class-validator';
import { SiteSurveyPoint } from '../../site-survey-points/site-survey-points.entity';
import { Site } from '../../sites/sites.entity';
import { EntityExists } from '../../validations/entity-exists.constraint';

export class PoiDataDto {
  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsNumber()
  @Validate(EntityExists, [Site])
  siteId: number;

  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsNumber()
  @Validate(EntityExists, [SiteSurveyPoint])
  surveyPointId: number;
}
