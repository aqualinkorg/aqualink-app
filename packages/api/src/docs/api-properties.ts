import { applyDecorators } from '@nestjs/common';
import {
  ApiBody,
  ApiConsumes,
  ApiProperty,
  getSchemaPath,
} from '@nestjs/swagger';
import { UpdateSiteApplicationDto } from '../site-applications/dto/update-site-application.dto';
import { UpdateSiteWithApplicationDto } from '../site-applications/dto/update-site-with-application.dto';
import {
  CreateSiteApplicationDto,
  CreateSiteDto,
} from '../sites/dto/create-site.dto';
import { PointSchema } from './api-schemas';

export const ApiPointProperty = () => applyDecorators(ApiProperty(PointSchema));

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

export const ApiUpdateSiteApplicationBody = () =>
  applyDecorators(
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          site: {
            $ref: getSchemaPath(UpdateSiteWithApplicationDto),
          },
          siteApplication: {
            $ref: getSchemaPath(UpdateSiteApplicationDto),
          },
        },
      },
    }),
  );

export const ApiCreateSiteBody = () =>
  applyDecorators(
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          site: {
            $ref: getSchemaPath(CreateSiteDto),
          },
          siteApplication: {
            $ref: getSchemaPath(CreateSiteApplicationDto),
          },
        },
      },
    }),
  );
