import { IsNumber, IsOptional, IsString, Validate } from 'class-validator';
import { Reef } from '../../reefs/reefs.entity';
import { EntityExists } from '../../validations/entity-exists.constraint';

export class FilterCollectionDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumber()
  @Validate(EntityExists, [Reef])
  reefId?: number;
}
