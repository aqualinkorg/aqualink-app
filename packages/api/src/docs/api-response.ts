import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ErrorResponse } from './error.dto';

export const ApiNestNotFoundResponse = (description: string) => {
  return applyDecorators(
    ApiNotFoundResponse({
      type: ErrorResponse,
      description,
    }),
  );
};

export const ApiNestBadRequestResponse = (description: string) => {
  return applyDecorators(
    ApiBadRequestResponse({
      type: ErrorResponse,
      description,
    }),
  );
};

export const ApiNestUnauthorizedResponse = (description: string) => {
  return applyDecorators(
    ApiUnauthorizedResponse({
      type: ErrorResponse,
      description,
    }),
  );
};
