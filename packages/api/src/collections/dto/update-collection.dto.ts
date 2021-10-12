import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  Validate,
} from 'class-validator';
import { Site } from '../../sites/sites.entity';
import { User } from '../../users/users.entity';
import { EntityExists } from '../../validations/entity-exists.constraint';

export class UpdateCollectionDto {
  @ApiProperty({ example: 'La Niña heatwave 20/21' })
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @ApiProperty({ example: 1 })
  @IsOptional()
  @IsNumber()
  @Validate(EntityExists, [User])
  userId?: number;

  @ApiProperty({ example: [1, 3, 4] })
  @IsOptional()
  @IsNumber({}, { each: true })
  @Validate(EntityExists, [Site], { each: true })
  addSiteIds?: number[];

  @ApiProperty({ example: [1, 4, 5] })
  @IsOptional()
  @IsNumber({}, { each: true })
  @Validate(EntityExists, [Site], { each: true })
  removeSiteIds?: number[];
}
