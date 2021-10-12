import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateSiteWithApplicationDto {
  @ApiProperty({ example: 'Duxbury Site' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly name?: string;

  @ApiProperty({ example: 32 })
  @IsOptional()
  @IsInt()
  readonly depth?: number;
}
