import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { SchemaObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';

class ErrorResponse {
  @ApiProperty({ example: 400 })
  statusCode: number;

  @ApiProperty({ example: 'Validation failed' })
  message: string;

  @ApiProperty({ example: 'Bad Request' })
  error: string;
}

const errorTemplates: Record<number, ErrorResponse> = {
  [HttpStatus.BAD_REQUEST]: {
    statusCode: HttpStatus.BAD_REQUEST,
    message: 'Validation failed',
    error: 'Bad Request',
  },
  [HttpStatus.UNAUTHORIZED]: {
    statusCode: HttpStatus.UNAUTHORIZED,
    message: 'Not authorized',
    error: 'Unauthorized',
  },
  [HttpStatus.NOT_FOUND]: {
    statusCode: HttpStatus.NOT_FOUND,
    message: 'Resource not found',
    error: 'Not Found',
  },
};

export const errorSchema = (errorCode: number): SchemaObject => {
  const errorResponse = errorTemplates[errorCode];

  return {
    type: 'object',
    properties: {
      statusCode: {
        type: 'number',
        example: errorResponse.statusCode,
      },
      message: {
        type: 'string',
        example: errorResponse.message,
      },
      error: {
        type: 'string',
        example: errorResponse.error,
      },
    },
  };
};
