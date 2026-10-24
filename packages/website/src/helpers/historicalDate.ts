import { DateTime } from 'luxon-extensions';

/** URL query param holding the historical date (YYYY-MM-DD) of the map/site. */
export const HISTORICAL_DATE_PARAM = 'date';

/** Earliest date with satellite (NOAA Coral Reef Watch) daily data. */
export const MIN_HISTORICAL_DATE = '1985-01-01';

/** Number of days of daily data shown before a historical date. */
export const HISTORICAL_DAILY_DATA_DAYS = 90;

const HISTORICAL_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export const todayISODate = () => DateTime.utc().toISODate() as string;

/**
 * A valid historical date is a real calendar day formatted as YYYY-MM-DD,
 * between MIN_HISTORICAL_DATE and today (UTC). Today counts as "latest".
 */
export const isValidHistoricalDate = (value?: string | null): boolean => {
  if (!value || !HISTORICAL_DATE_REGEX.test(value)) return false;
  const date = DateTime.fromISO(value, { zone: 'utc' });
  return date.isValid && value >= MIN_HISTORICAL_DATE && value < todayISODate();
};

/** Range (ISO strings) of daily data to show for a historical date. */
export const getHistoricalDailyDataRange = (date: string) => {
  const end = DateTime.fromISO(date, { zone: 'utc' }).endOf('day');
  return {
    start: end
      .minus({ days: HISTORICAL_DAILY_DATA_DAYS })
      .startOf('day')
      .toISOString() as string,
    end: end.toISOString() as string,
  };
};

/**
 * Site page link keeping the historical date. The `start`/`end` params make
 * the site charts end on the selected date.
 */
export const getSiteUrl = (
  siteId: number | string,
  date?: string | null,
  extraParams: Record<string, string> = {},
) => {
  const params = new URLSearchParams(extraParams);
  if (date && isValidHistoricalDate(date)) {
    const end = DateTime.fromISO(date, { zone: 'utc' });
    params.set(HISTORICAL_DATE_PARAM, date);
    params.set('start', end.minus({ months: 1 }).toISODate() as string);
    params.set('end', date);
  }
  const search = params.toString();
  return `/sites/${siteId}${search ? `?${search}` : ''}`;
};

export const formatHistoricalDate = (date: string) =>
  DateTime.fromISO(date, { zone: 'utc' }).toFormat('LLL d, yyyy');
