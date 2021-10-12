import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, Validate } from 'class-validator';
import { SitePointOfInterest } from '../../site-pois/site-pois.entity';
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
  @Validate(EntityExists, [SitePointOfInterest])
  poiId: number;
}
