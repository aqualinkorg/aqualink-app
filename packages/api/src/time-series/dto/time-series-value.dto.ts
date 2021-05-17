import { ApiProperty } from '@nestjs/swagger';

export class TimeSeriesValueDto {
  @ApiProperty({ example: '2021-05-17T13:52:19.454Z' })
  timestamp: string;

  @ApiProperty({ example: 11.05 })
  value: number;
}
