import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsString, IsOptional, IsDate } from 'class-validator';

export class UpdateSiteApplicationDto {
  @ApiProperty({ example: 'Permit requirements' })
  @IsString()
  @IsNotEmpty()
  readonly permitRequirements: string;

  @ApiProperty({ example: 'Funding Source' })
  @IsString()
  @IsNotEmpty()
  readonly fundingSource: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  readonly installationSchedule?: Date;

  @ApiProperty({ example: 'Installation Resources' })
  @IsString()
  @IsNotEmpty()
  readonly installationResources: string;
}
