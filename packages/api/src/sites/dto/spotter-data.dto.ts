import { TimeSeriesValueDto } from '../../time-series/dto/time-series-value.dto';
import { ApiProperty } from '@nestjs/swagger';

export class SpotterDataDto {
  @ApiProperty({ type: () => [TimeSeriesValueDto] })
  topTemperature: TimeSeriesValueDto[];
  @ApiProperty({ type: () => [TimeSeriesValueDto] })
  bottomTemperature: TimeSeriesValueDto[];
}
