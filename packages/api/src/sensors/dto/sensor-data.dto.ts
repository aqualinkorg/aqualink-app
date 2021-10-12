import { SourceType } from '../../sites/schemas/source-type.enum';
import { TimeSeriesPoint } from '../../time-series/dto/time-series-point.dto';
import { Metric } from '../../time-series/metrics.entity';

export class SensorDataDto {
  [SourceType.SPOTTER]?: {
    [Metric.BOTTOM_TEMPERATURE]?: TimeSeriesPoint;
    [Metric.TOP_TEMPERATURE]?: TimeSeriesPoint;
  };
  [SourceType.HOBO]?: {
    [Metric.BOTTOM_TEMPERATURE]?: TimeSeriesPoint;
  };
  [SourceType.NOAA]?: {
    [Metric.SATELLITE_TEMPERATURE]?: TimeSeriesPoint;
  };
}
