import { applyDecorators } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptions } from '@nestjs/swagger';

export const ApiPointProperty = () => {
  const schema: ApiPropertyOptions = {
    type: 'object',
    properties: {
      type: {
        type: 'string',
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

  return applyDecorators(ApiProperty(schema));
};
