import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsDateString,
} from 'class-validator';

export class UpdateReefApplicationDto {
  @ApiProperty({ example: 'Permit requirements' })
  @IsString()
  @IsNotEmpty()
  readonly permitRequirements: string;

  @ApiProperty({ example: 'Funding Source' })
  @IsString()
  @IsNotEmpty()
  readonly fundingSource: string;

  @IsOptional()
  @IsDateString()
  readonly installationSchedule?: Date;

  @ApiProperty({ example: 'Installation Resources' })
  @IsString()
  @IsNotEmpty()
  readonly installationResources: string;
}
