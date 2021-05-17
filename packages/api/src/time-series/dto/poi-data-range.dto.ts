import { ApiProperty } from '@nestjs/swagger';
import { IsNumberString, Validate } from 'class-validator';
import { ReefPointOfInterest } from '../../reef-pois/reef-pois.entity';
import { Reef } from '../../reefs/reefs.entity';
import { EntityExists } from '../../validations/entity-exists.constraint';

export class PoiDataRangeDto {
  @ApiProperty({ example: 1 })
  @IsNumberString()
  @Validate(EntityExists, [Reef])
  reefId: number;

  @ApiProperty({ example: 1 })
  @IsNumberString()
  @Validate(EntityExists, [ReefPointOfInterest])
  poiId: number;
}
