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
    example: '2024-03-01',
    description:
      'ISO date string to retrieve historical collection data for that date',
  })
  @IsOptional()
  @IsDateString()
  readonly date?: string;
}
