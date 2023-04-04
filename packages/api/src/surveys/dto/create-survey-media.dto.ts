import {
  IsUrl,
  IsBoolean,
  IsOptional,
  IsJSON,
  IsEnum,
  IsString,
  IsInt,
  Validate,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Observations } from '../survey-media.entity';
import { SiteSurveyPoint } from '../../site-survey-points/site-survey-points.entity';
import { EntityExists } from '../../validations/entity-exists.constraint';

export class CreateSurveyMediaDto {
  @ApiProperty({
    example:
      'https://storage.googleapis.com/storage/reef-image-564894612222.jpg',
  })
  @IsUrl()
  readonly url: string;

  @IsUrl()
  @IsOptional()
  readonly thumbnailUrl?: string;

  @IsInt()
  @IsOptional()
  readonly quality: number = 1;

  @IsBoolean()
  @IsOptional()
  readonly featured: boolean = false;

  @IsBoolean()
  @IsOptional()
  readonly hidden: boolean = false;

  @IsJSON()
  @IsOptional()
  readonly metadata: any = {};

  @IsEnum(Observations)
  readonly observations: Observations;

  @ApiProperty({ example: 'Survey Media comments' })
  @IsString()
  @IsOptional()
  readonly comments?: string;

  @IsInt()
  @IsOptional()
  @Validate(EntityExists, [SiteSurveyPoint])
  readonly surveyPointId: number;
}
