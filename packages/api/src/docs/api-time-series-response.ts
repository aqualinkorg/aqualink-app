import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';
import { SchemaObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';
import { SourceType } from '../reefs/sources.entity';
import { Metric } from '../time-series/metrics.entity';

const reduceArrayToObject = <T>(previousValue: T, currentValue: T) => {
  return {
    ...currentValue,
    ...previousValue,
  };
};

export const ApiTimeSeriesResponse = () => {
  const sources = Object.values(SourceType)
    .map((source) => {
      const metrics = Object.values(Metric)
        .map(
          (metric): Record<string, SchemaObject> => {
            return {
              [metric]: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    timestamp: {
                      type: 'string',
                      format: 'date-time',
                    },
                    value: {
                      type: 'number',
                    },
                  },
                },
              },
            };
          },
        )
        .reduce(reduceArrayToObject, {});

      return {
        [source]: {
          type: 'object',
          properties: metrics,
        },
      };
    })
    .reduce(reduceArrayToObject, {});

  return applyDecorators(
    ApiOkResponse({
      schema: {
        type: 'object',
        properties: sources,
      },
    }),
  );
};

export const ApiTimeSeriesRangeResponse = () => {
  const sources = Object.values(SourceType)
    .map((source) => {
      const metrics = Object.values(Metric)
        .map(
          (metric): Record<string, SchemaObject> => {
            return {
              [metric]: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    maxDate: {
                      type: 'string',
                      format: 'date-time',
                    },
                    minDate: {
                      type: 'string',
                      format: 'date-time',
                    },
                  },
                },
              },
            };
          },
        )
        .reduce(reduceArrayToObject, {});

      return {
        [source]: {
          type: 'object',
          properties: metrics,
        },
      };
    })
    .reduce(reduceArrayToObject, {});

  return applyDecorators(
    ApiOkResponse({
      schema: {
        type: 'object',
        properties: sources,
      },
    }),
  );
};
