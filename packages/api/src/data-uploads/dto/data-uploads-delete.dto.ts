import { ApiProperty } from '@nestjs/swagger';

export class DataUploadsDeleteDto {
  @ApiProperty({ example: [1, 2] })
  ids: number[];
}
