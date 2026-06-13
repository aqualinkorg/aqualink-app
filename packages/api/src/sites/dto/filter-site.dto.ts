import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsInt,
  IsEnum,
  IsBooleanString,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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

  @ApiPropertyOptional({ example: '2024-04-10' })
  @IsOptional()
  @IsDateString()
  readonly date?: string;
}
