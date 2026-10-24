import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsInt,
  IsEnum,
  IsBooleanString,
  IsDateString,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { SiteStatus } from '../sites.entity';

export class FilterSiteDto {
  @ApiProperty({ example: '2025-01-15', required: false })
  @IsOptional()
  @IsDateString({ strict: true })
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  readonly date?: string;

  @ApiProperty({ example: 'Duxbury Site' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly name?: string;

  @IsOptional()
  @IsString()
  @IsEnum(SiteStatus)
  readonly status?: SiteStatus;

  @ApiProperty({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  readonly regionId?: number;

  @ApiProperty({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  readonly adminId?: number;

  @IsOptional()
  @IsBooleanString()
  readonly hasSpotter?: string;
}
