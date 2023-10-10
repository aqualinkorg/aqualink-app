import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, Validate } from 'class-validator';
import { Site } from '../../sites/sites.entity';
import { EntityExists } from '../../validations/entity-exists.constraint';

export class GetWindWaveDataDTO {
  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsNumber()
  @Validate(EntityExists, [Site])
  siteId: number;
}
