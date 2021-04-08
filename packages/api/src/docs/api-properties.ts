import { applyDecorators } from '@nestjs/common';
import {
  ApiBody,
  ApiConsumes,
  ApiProperty,
  ApiPropertyOptions,
} from '@nestjs/swagger';

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

export const ApiFileUpload = () => {
  const maxFileSizeMB = process.env.STORAGE_MAX_FILE_SIZE_MB
    ? parseInt(process.env.STORAGE_MAX_FILE_SIZE_MB, 10)
    : 1;

  return applyDecorators(
    ApiConsumes('multipart/form-data'),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          file: {
            description: `The image to upload (image/jpeg, image/png, image/tiff). Max size: ${maxFileSizeMB}MB`,
            type: 'string',
            format: 'binary',
          },
        },
      },
    }),
  );
};
