import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { errorSchema } from './error.dto';

export const ApiNestNotFoundResponse = (description: string) =>
  applyDecorators(
    ApiNotFoundResponse({
      schema: errorSchema(HttpStatus.NOT_FOUND),
      description,
    }),
  );

export const ApiNestBadRequestResponse = (description: string) =>
  applyDecorators(
    ApiBadRequestResponse({
      schema: errorSchema(HttpStatus.BAD_REQUEST),
      description,
    }),
  );

export const ApiNestUnauthorizedResponse = (description: string) =>
  applyDecorators(
    ApiUnauthorizedResponse({
      schema: errorSchema(HttpStatus.UNAUTHORIZED),
      description,
    }),
  );
