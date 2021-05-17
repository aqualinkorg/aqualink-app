import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Validate } from 'class-validator';
import { Reef } from '../../reefs/reefs.entity';
import { EntityExists } from '../../validations/entity-exists.constraint';

export class FilterCollectionDto {
  @ApiProperty({ example: 'Some collection name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 1 })
  @IsOptional()
  @IsNumber()
  @Validate(EntityExists, [Reef])
  reefId?: number;
}
