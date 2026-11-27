import { DateTime } from 'luxon-extensions';

const DAY_FORMAT = 'yyyy-MM-dd';

/** Whether `value` is a real calendar day (YYYY-MM-DD) that is not in the future. */
export const isPastOrTodayDay = (value: string): boolean => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const day = DateTime.fromFormat(value, DAY_FORMAT, { zone: 'utc' });
  return day.isValid && day <= DateTime.utc().endOf('day');
};

export const toDayString = (date: Date): string =>
  DateTime.fromJSDate(date).toFormat(DAY_FORMAT);

/** Link to a site's page, showing it as it was on `day` when one is selected on the map. */
export const siteLinkForDay = (
  siteId: number | string,
  day?: string | null,
): string => (day ? `/sites/${siteId}?date=${day}` : `/sites/${siteId}`);

/** The month leading up to `day`, as the `start`/`end` query params the site charts use. */
export const chartWindowForDay = (day: string) => ({
  start: DateTime.fromFormat(day, DAY_FORMAT)
    .minus({ months: 1 })
    .toFormat(DAY_FORMAT),
  end: day,
});

/**
 * The query string with the chart window for a past day (`?date=`) added, or
 * null when there is nothing to add: no valid day, or a window already set.
 */
export const searchWithChartWindow = (search: string): string | null => {
  const params = new URLSearchParams(search);
  const day = params.get('date');
  if (
    !day ||
    !isPastOrTodayDay(day) ||
    params.get('start') ||
    params.get('end')
  )
    return null;
  const { start, end } = chartWindowForDay(day);
  params.set('start', start);
  params.set('end', end);
  return params.toString();
};

export const formatDay = (day: string): string =>
  DateTime.fromFormat(day, DAY_FORMAT).toFormat('LLL d, yyyy');
