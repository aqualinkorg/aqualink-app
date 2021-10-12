import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsInt,
  IsLatitude,
  IsLongitude,
  IsDate,
} from 'class-validator';

export class CreateSiteDto {
  @ApiProperty({ example: 'Duxbury Site' })
  @IsString()
  @IsNotEmpty()
  readonly name: string;

  @ApiProperty({ example: 13.21651 })
  @IsLatitude()
  readonly latitude: number;

  @ApiProperty({ example: 132.51651 })
  @IsLongitude()
  readonly longitude: number;

  @ApiProperty({ example: 15 })
  @IsOptional()
  @IsInt()
  readonly depth: number;
}

export class CreateSiteApplicationDto {
  @ApiProperty({ example: 'Some permit requirements' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly permitRequirements?: string;

  @ApiProperty({ example: 'Some funding source' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly fundingSource?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  readonly installationSchedule?: Date;

  @ApiProperty({ example: 'Some installation resources' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly installationResources?: string;
}
