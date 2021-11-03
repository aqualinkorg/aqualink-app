import {
  IsNotEmpty,
  IsString,
  IsOptional,
  Validate,
  IsInt,
  IsUrl,
  IsLatitude,
  IsLongitude,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { EntityExists } from '../../validations/entity-exists.constraint';
import { Site } from '../../sites/sites.entity';

export class CreateSiteSurveyPointDto {
  @ApiProperty({ example: 'Outer tide pool' })
  @IsString()
  @IsNotEmpty()
  readonly name: string;

  @ApiProperty({ example: 12.4344 })
  @IsOptional()
  @IsLatitude()
  readonly latitude?: number;

  @ApiProperty({ example: -21.2233 })
  @IsOptional()
  @IsLongitude()
  readonly longitude?: number;

  @ApiProperty({ example: 1 })
  @IsOptional()
  @IsInt()
  readonly surveyPointLabelId?: number;

  @ApiProperty({ example: 'http://some-sample-url.com' })
  @IsOptional()
  @IsUrl()
  readonly imageUrl?: string;

  @ApiProperty({ example: 2 })
  @IsInt()
  @Validate(EntityExists, [Site])
  readonly siteId: number;
}
