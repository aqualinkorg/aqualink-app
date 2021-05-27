import { ApiProperty } from '@nestjs/swagger';

export class TimeSeriesPoint {
  timestamp: Date;

  @ApiProperty({ example: 24 })
  value: number;
}
