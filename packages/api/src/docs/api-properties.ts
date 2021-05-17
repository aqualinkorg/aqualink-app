import { applyDecorators } from '@nestjs/common';
import {
  ApiBody,
  ApiConsumes,
  ApiProperty,
  ApiPropertyOptions,
  getSchemaPath,
} from '@nestjs/swagger';
import { UpdateReefApplicationDto } from '../reef-applications/dto/update-reef-application.dto';
import { UpdateReefWithApplicationDto } from '../reef-applications/dto/update-reef-with-application.dto';
import {
  CreateReefApplicationDto,
  CreateReefDto,
} from '../reefs/dto/create-reef.dto';

export const ApiPointProperty = () => {
  const schema: ApiPropertyOptions = {
    type: 'object',
    properties: {
      type: {
        type: 'string',
        enum: ['Point'],
      },
      coordinates: {
        type: 'array',
        description: 'Longitude and latitude',
        items: {
          type: 'number',
        },
        example: [15.24012, -10.05412],
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

export const ApiUpdateReefApplicationBody = () => {
  return applyDecorators(
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          reef: {
            $ref: getSchemaPath(UpdateReefWithApplicationDto),
          },
          reefApplication: {
            $ref: getSchemaPath(UpdateReefApplicationDto),
          },
        },
      },
    }),
  );
};

export const ApiCreateReefBody = () => {
  return applyDecorators(
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          reef: {
            $ref: getSchemaPath(CreateReefDto),
          },
          reefApplication: {
            $ref: getSchemaPath(CreateReefApplicationDto),
          },
        },
      },
    }),
  );
};
