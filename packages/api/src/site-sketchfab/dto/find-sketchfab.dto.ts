import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsInt, Validate } from 'class-validator';
import { Site } from '../../sites/sites.entity';
import { EntityExists } from '../../validations/entity-exists.constraint';

export class FindSketchFabDto {
  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  @Validate(EntityExists, [Site])
  siteId: number;
}
