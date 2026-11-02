import { DateTime } from 'luxon-extensions';

/** Query param used to view the map and site pages on a past day. */
export const HISTORICAL_DATE_PARAM = 'date';

const DATE_FORMAT = /^\d{4}-\d{2}-\d{2}$/;

/** Today's date (UTC) as YYYY-MM-DD, the latest day that can be selected. */
export const todayUtc = (): string => DateTime.now().toUTC().toISODate() || '';

/**
 * A historical date is a valid YYYY-MM-DD UTC day that is not in the future.
 */
export const isValidHistoricalDate = (value?: string | null): boolean => {
  if (!value || !DATE_FORMAT.test(value)) return false;
  const day = DateTime.fromISO(value, { zone: 'utc' });
  return day.isValid && value <= todayUtc();
};

/** Reads a valid historical date from a location search string. */
export const getHistoricalDateFromSearch = (
  search: string,
): string | undefined => {
  const value = new URLSearchParams(search).get(HISTORICAL_DATE_PARAM);
  return value && isValidHistoricalDate(value) ? value : undefined;
};

/** Appends the historical date to a path, if there is one. */
export const withHistoricalDate = (path: string, date?: string | null) =>
  date ? `${path}?${HISTORICAL_DATE_PARAM}=${date}` : path;

/** Formats a YYYY-MM-DD day for display, e.g. "Mar 15, 2024". */
export const formatHistoricalDate = (date: string) =>
  DateTime.fromISO(date, { zone: 'utc' }).toFormat('LLL d, yyyy');
