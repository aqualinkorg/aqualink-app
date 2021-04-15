import { TimeSeriesValueDto } from '../../time-series/dto/time-series-value.dto';

export class SpotterDataDto {
  topTemperature: TimeSeriesValueDto[];
  bottomTemperature: TimeSeriesValueDto[];
}
