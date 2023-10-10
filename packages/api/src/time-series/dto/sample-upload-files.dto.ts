import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { SourceType } from '../../sites/schemas/source-type.enum';

export class SampleUploadFilesDto {
  @ApiProperty({ example: 1 })
  @IsEnum(SourceType)
  source: SourceType;
}
