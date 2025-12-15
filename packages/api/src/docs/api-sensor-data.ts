import { ApiPropertyOptions, getSchemaPath } from '@nestjs/swagger';
import { SourceType } from '../sites/schemas/source-type.enum';
import { TimeSeriesPoint } from '../time-series/dto/time-series-point.dto';

export const sensorDataSchema: ApiPropertyOptions = {
  type: 'object',
  properties: {
    [SourceType.SPOTTER]: {
      type: 'object',
      properties: {
        bottomTemperature: {
          allOf: [{ $ref: getSchemaPath(TimeSeriesPoint) }],
        },
        topTemperature: {
          allOf: [{ $ref: getSchemaPath(TimeSeriesPoint) }],
        },
      },
    },
    [SourceType.HOBO]: {
      type: 'object',
      properties: {
        bottomTemperature: {
          allOf: [{ $ref: getSchemaPath(TimeSeriesPoint) }],
        },
      },
    },
    [SourceType.NOAA]: {
      type: 'object',
      properties: {
        satelliteTemperature: {
          allOf: [{ $ref: getSchemaPath(TimeSeriesPoint) }],
        },
      },
    },
  },
};
