import { IsNotEmpty, MaxLength, IsOptional, Validate } from 'class-validator';
import { EntityExists } from '../../validations/entity-exists.constraint';
import { Region } from '../regions.entity';

export class CreateRegionDto {
  @IsNotEmpty()
  @MaxLength(50)
  readonly name: string;

  @IsNotEmpty()
  readonly polygon: string;

  @IsOptional()
  @IsNotEmpty()
  @Validate(EntityExists, [Region])
  readonly parentId?: number;
}
