import { LatestData } from '../../time-series/latest-data.entity';
import { ApiProperty } from '@nestjs/swagger';

export class SofarLatestDataDto {
  @ApiProperty({ type: () => [LatestData] })
  latestData?: LatestData[];
}
