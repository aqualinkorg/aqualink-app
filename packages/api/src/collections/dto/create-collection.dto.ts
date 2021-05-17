import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Validate,
} from 'class-validator';
import { Reef } from '../../reefs/reefs.entity';
import { User } from '../../users/users.entity';
import { EntityExists } from '../../validations/entity-exists.constraint';

export class CreateCollectionDto {
  @ApiProperty({ example: 'Some collection name' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsNumber()
  @Validate(EntityExists, [User])
  userId: number;

  @ApiProperty({ example: [1, 3, 5] })
  @IsNotEmpty()
  @IsNumber({}, { each: true })
  @Validate(EntityExists, [Reef], { each: true })
  reefIds: number[];
}
