import { applyDecorators } from '@nestjs/common';
import { ApiNotFoundResponse } from '@nestjs/swagger';
import { ErrorResponse } from './error.dto';

export const CustomApiNotFoundResponse = (description: string) => {
  return applyDecorators(
    ApiNotFoundResponse({
      type: ErrorResponse,
      description,
    }),
  );
};
