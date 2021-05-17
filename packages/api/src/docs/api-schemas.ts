import { ApiPropertyOptions } from '@nestjs/swagger';
import { SchemaObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';

export const PointSchema: SchemaObject & ApiPropertyOptions = {
  type: 'object',
  properties: {
    type: {
      type: 'string',
      example: 'Point',
    },
    coordinates: {
      type: 'array',
      description: 'Longitude and latitude',
      items: {
        type: 'number',
      },
      example: [0, 0],
    },
  },
};
