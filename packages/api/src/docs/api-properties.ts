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
        // Since type can only be 'Point' for now, we declare it as a enum with a single value
        // This is the only way to declare a constant value on a property
        // Reference: https://swagger.io/docs/specification/describing-parameters/#constant
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
