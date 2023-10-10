import { SourceType } from '../../sites/schemas/source-type.enum';
import { TimeSeriesPoint } from '../../time-series/dto/time-series-point.dto';
import { Metric } from '../../time-series/metrics.enum';
import { KeysToCamelCase } from '../../utils/type-utils';

type MetricAsCamelcase = KeysToCamelCase<Record<Metric, TimeSeriesPoint>>;

interface SensorDataDtoType {
  [SourceType.SPOTTER]?: Partial<
    Pick<MetricAsCamelcase, 'bottomTemperature' | 'topTemperature'>
  >;
  [SourceType.HOBO]?: Partial<Pick<MetricAsCamelcase, 'bottomTemperature'>>;
  [SourceType.NOAA]?: Partial<Pick<MetricAsCamelcase, 'satelliteTemperature'>>;
}

export class SensorDataDto implements SensorDataDtoType {
  [SourceType.SPOTTER]?: {
    bottomTemperature?: TimeSeriesPoint;
    topTemperature?: TimeSeriesPoint;
  };
  [SourceType.HOBO]?: {
    bottomTemperature?: TimeSeriesPoint;
  };
  [SourceType.NOAA]?: {
    satelliteTemperature?: TimeSeriesPoint;
  };
}
