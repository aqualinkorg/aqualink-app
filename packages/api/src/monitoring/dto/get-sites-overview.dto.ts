import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Max, Min, Validate } from 'class-validator';
import { Site, SiteStatus } from 'sites/sites.entity';
import { EntityExists } from 'validations/entity-exists.constraint';

export class GetSitesOverviewDto {
  @ApiProperty({ example: 42 })
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @Max(1000000)
  @IsInt()
  @Validate(EntityExists, [Site])
  siteId?: number;

  @ApiProperty({ example: 'Bellows South Africa' })
  @Type(() => String)
  @IsOptional()
  siteName?: string;

  @ApiProperty({ example: 'SPOT-2742' })
  @Type(() => String)
  @IsOptional()
  spotterId?: string;

  @ApiProperty({ example: 'admin@example.com' })
  @Type(() => String)
  @IsOptional()
  adminEmail?: string;

  @ApiProperty({ example: 'John Smith' })
  @Type(() => String)
  @IsOptional()
  adminUsername?: string;

  @ApiProperty({ example: 'Aqualink' })
  @Type(() => String)
  @IsOptional()
  organization?: string;

  @ApiProperty({ example: 'deployed' })
  @IsOptional()
  @IsEnum(SiteStatus)
  status?: SiteStatus;
}
