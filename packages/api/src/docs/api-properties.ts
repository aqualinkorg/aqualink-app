import { applyDecorators } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiProperty,
  ApiPropertyOptions,
} from '@nestjs/swagger';
import { ErrorResponse } from './error.dto';

export const PointApiProperty = () => {
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

export const CustomApiNotFoundResponse = (description: string) => {
  return applyDecorators(
    ApiNotFoundResponse({
      type: ErrorResponse,
      description,
    }),
  );
};
