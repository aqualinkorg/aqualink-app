import { ApiPropertyOptions, getSchemaPath } from '@nestjs/swagger';
import { SourceType } from '../reefs/schemas/source-type.enum';
import { TimeSeriesPoint } from '../time-series/dto/time-series-point.dto';
import { Metric } from '../time-series/metrics.entity';

export const sensorDataSchema: ApiPropertyOptions = {
  type: 'object',
  properties: {
    [SourceType.SPOTTER]: {
      type: 'object',
      properties: {
        [Metric.BOTTOM_TEMPERATURE]: {
          $ref: getSchemaPath(TimeSeriesPoint),
        },
        [Metric.TOP_TEMPERATURE]: {
          $ref: getSchemaPath(TimeSeriesPoint),
        },
      },
    },
    [SourceType.HOBO]: {
      type: 'object',
      properties: {
        [Metric.BOTTOM_TEMPERATURE]: {
          $ref: getSchemaPath(TimeSeriesPoint),
        },
      },
    },
    [SourceType.NOAA]: {
      type: 'object',
      properties: {
        [Metric.SATELLITE_TEMPERATURE]: {
          $ref: getSchemaPath(TimeSeriesPoint),
        },
      },
    },
  },
};
