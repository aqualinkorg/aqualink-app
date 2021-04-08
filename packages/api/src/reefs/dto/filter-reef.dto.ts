import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsInt,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ReefStatus } from '../reefs.entity';

export class FilterReefDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly name?: string;

  @IsOptional()
  @IsString()
  @IsEnum(ReefStatus)
  readonly status?: ReefStatus;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  readonly regionId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  readonly adminId?: number;
}
