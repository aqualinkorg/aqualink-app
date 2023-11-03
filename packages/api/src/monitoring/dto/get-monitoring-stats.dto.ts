import { BadRequestException } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsDate, IsNumber, IsOptional, Validate } from 'class-validator';
import { Site } from 'sites/sites.entity';
import { EntityExists } from 'validations/entity-exists.constraint';

const maxAllowedIds = 10;

export class GetMonitoringStatsDto {
  @ApiProperty({ example: [1, 3, 5] })
  @IsOptional()
  @Transform(({ value }) => {
    try {
      const splitted = value.split(',');

      if (splitted.length > maxAllowedIds) {
        throw new BadRequestException(
          `siteIds: Too many IDs. Maximum allowed: ${maxAllowedIds}.`,
        );
      }

      return splitted.map((x) => parseInt(x, 10));
    } catch (error) {
      throw new BadRequestException('siteIds: invalid format');
    }
  })
  @IsNumber({}, { each: true })
  @Validate(EntityExists, [Site], { each: true })
  siteIds?: number[];

  @ApiProperty({ example: 'SPOT-2742' })
  @Type(() => String)
  @IsOptional()
  spotterId?: string;

  @IsOptional()
  @Transform(({ value }) => {
    return [true, 'true', 1, '1'].indexOf(value) > -1;
  })
  monthly?: boolean;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  start?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  end?: Date;
}
