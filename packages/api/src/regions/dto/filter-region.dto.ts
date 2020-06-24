import { IsNotEmpty, IsOptional, Validate } from 'class-validator';
import { EntityExists } from '../../validations/entity-exists.constraint';
import { Region } from '../regions.entity';

export class FilterRegionDto {
  @IsOptional()
  @IsNotEmpty()
  readonly name?: string;

  @IsOptional()
  @IsNotEmpty()
  @Validate(EntityExists, [Region])
  readonly parentId?: number;
}
