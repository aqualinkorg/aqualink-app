import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsInt,
  IsEnum,
  IsBooleanString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { SiteStatus } from '../sites.entity';

export class FilterSiteDto {
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

  @ApiProperty({
    example: '2025-06-01',
    description:
      'Optional ISO date. When provided, collectionData reflects the most recent daily data on or before this date instead of the latest data.',
  })
  @IsOptional()
  @IsString()
  readonly date?: string;
}
