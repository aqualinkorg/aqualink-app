import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse, getSchemaPath } from '@nestjs/swagger';
import { Reef, SensorType } from '../reefs/reefs.entity';
import { PointSchema } from './api-schemas';

export const ApiCloudAtlasSensorsResponse = () => {
  return applyDecorators(
    ApiOkResponse({
      schema: {
        type: 'array',
        items: {
          allOf: [
            {
              $ref: getSchemaPath(Reef),
            },
            {
              type: 'object',
              properties: {
                sensorPosition: PointSchema,
                sensorType: {
                  type: 'string',
                  enum: Object.values(SensorType),
                },
              },
            },
          ],
        },
      },
    }),
  );
};
