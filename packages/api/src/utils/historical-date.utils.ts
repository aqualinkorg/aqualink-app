import { BadRequestException } from '@nestjs/common';
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { DateTime } from '../luxon-extensions';

/**
 * Daily data older than this (relative to the requested date) is considered
 * stale and is not used to color a site, so a site whose data stopped
 * months earlier does not show an outdated alert level.
 */
export const HISTORICAL_DATA_MAX_AGE_DAYS = 7;

/**
 * Converts a YYYY-MM-DD string into the end of that day (UTC), which is
 * how daily_data dates are stored by the daily worker.
 */
export const getHistoricalUntil = (date: string): Date =>
  DateTime.fromISO(date, { zone: 'utc' }).endOf('day').toJSDate();

export const getHistoricalSince = (until: Date): Date =>
  DateTime.fromJSDate(until, { zone: 'utc' })
    .minus({ days: HISTORICAL_DATA_MAX_AGE_DAYS })
    .startOf('day')
    .toJSDate();

export const HISTORICAL_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export const isValidHistoricalDate = (value: unknown): value is string =>
  typeof value === 'string' &&
  HISTORICAL_DATE_REGEX.test(value) &&
  DateTime.fromISO(value, { zone: 'utc' }).isValid;

/**
 * Parses a YYYY-MM-DD query param into the end of that UTC day, throwing a
 * 400 for anything else. The DTO validates this too, but the service must
 * not rely on the global validation pipe alone.
 */
export const parseHistoricalDate = (date: string): Date => {
  if (!isValidHistoricalDate(date)) {
    throw new BadRequestException(
      'date must be a valid calendar date formatted as YYYY-MM-DD',
    );
  }
  return getHistoricalUntil(date);
};

@ValidatorConstraint({ name: 'validCalendarDate', async: false })
export class IsValidCalendarDate implements ValidatorConstraintInterface {
  validate(value: unknown) {
    if (value === undefined || value === null) return true;
    return isValidHistoricalDate(value);
  }

  defaultMessage() {
    return 'date must be a valid calendar date';
  }
}
