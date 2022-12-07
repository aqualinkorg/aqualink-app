import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Validate,
} from 'class-validator';
import { Site } from '../../sites/sites.entity';
import { User } from '../../users/users.entity';
import { EntityExists } from '../../validations/entity-exists.constraint';

export class CreateCollectionDto {
  @ApiProperty({ example: 'La Niña heatwave 20/21' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @ApiProperty({ example: 1 })
  @IsOptional()
  @IsNumber()
  @Validate(EntityExists, [User])
  userId: number;

  @ApiProperty({ example: [1, 3, 5] })
  @IsNotEmpty()
  @IsNumber({}, { each: true })
  @Validate(EntityExists, [Site], { each: true })
  siteIds: number[];
}
