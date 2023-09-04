import { range as createRange, orderBy } from 'lodash';
import { zonedTimeToUtc } from 'date-fns-tz';

import {
  DailyData,
  HistoricalMonthlyMean,
  HistoricalMonthlyMeanData,
  Range,
  ValueWithTimestamp,
} from 'store/Sites/types';
import { SurveyListItem } from 'store/Survey/types';
import { DateTime } from 'luxon';

type DateString = string | null | undefined;

interface DisplayDateParams {
  isoDate: DateString;
  format: string;
  displayTimezone: boolean;
  timeZone?: string | null;
  timeZoneToDisplay?: string | null;
}

export const isBefore = (
  start: string,
  end: string,
  excludeEndDate?: boolean,
) =>
  excludeEndDate
    ? new Date(start).getTime() < new Date(end).getTime()
    : new Date(start).getTime() <= new Date(end).getTime();

export const isBetween = (date: string, start: string, end: string) =>
  isBefore(date, end) && isBefore(start, date);

export const toRelativeTime = (timestamp: Date | string | number) => {
  const minute = 60;
  const hour = 60 * minute;
  const day = 24 * hour;

  const now = new Date().getTime();
  const start = new Date(timestamp).getTime();

  const timePeriodInSeconds = Math.floor((now - start) / 1000);
  const timePeriodInMinutes = Math.floor(timePeriodInSeconds / minute);
  const timePeriodInHours = Math.floor(timePeriodInSeconds / hour);
  const timePeriodInDays = Math.floor(timePeriodInSeconds / day);

  switch (true) {
    case timePeriodInSeconds < minute:
      return `${timePeriodInSeconds} sec. ago`;
    case timePeriodInSeconds < hour:
      return `${timePeriodInMinutes} min. ago`;
    case timePeriodInSeconds < day:
      return `${timePeriodInHours} hour${timePeriodInHours > 1 ? 's' : ''} ago`;
    default:
      return `${timePeriodInDays} day${timePeriodInDays > 1 ? 's' : ''} ago`;
  }
};
/**
 * Util function to sort an array by a specific date key
 * @param list The input array
 * @param dateKey The key to sort by
 * @param order The sort order
 * @returns A sorted by the input key array
 */
export const sortByDate = <T>(
  list: T[],
  dateKey: keyof T,
  order?: 'asc' | 'desc',
) =>
  orderBy(list, (item) => new Date(item[dateKey] as unknown as string), order);

/**
 * Depending on the type param, it calculates the maximum or minimun date
 * for the combined temperature data
 * @param dailyData - Array of daily data
 * @param spotterData - Object of spotterData (optional)
 * @param hoboBottomTemperature - Array of HOBO data (optional)
 * @param type - Type of date we seek (defaults to "max")
 */
export const findMarginalDate = (
  historicalMonthlyMeanData: HistoricalMonthlyMeanData[],
  dailyData: DailyData[],
  spotterBottomTemperature?: ValueWithTimestamp[],
  spotterTopTemperature?: ValueWithTimestamp[],
  hoboBottomTemperature?: ValueWithTimestamp[],
  type: 'min' | 'max' = 'max',
): string => {
  const combinedData = [
    ...historicalMonthlyMeanData,
    ...dailyData,
    ...(spotterTopTemperature?.map((item) => ({
      date: item.timestamp,
      value: item.value,
    })) || []),
    ...(spotterBottomTemperature?.map((item) => ({
      date: item.timestamp,
      value: item.value,
    })) || []),
    ...(hoboBottomTemperature?.map((item) => ({
      date: item.timestamp,
      value: item.value,
    })) || []),
  ];

  const sortedData = sortByDate(
    combinedData,
    'date',
    type === 'max' ? 'desc' : 'asc',
  );

  return sortedData[0].date;
};

export const findChartPeriod = (range: Range) => {
  switch (range) {
    case 'day':
      return 'hour';
    case 'week':
    default:
      return 'day';
  }
};

export function setTimeZone(date: Date, timeZone?: string | null): string;

export function setTimeZone(
  date: Date | null,
  timeZone?: string | null,
): string | null;

// Returns the same date but for a different time zone
export function setTimeZone(date: Date | null, timeZone?: string | null) {
  if (date && timeZone) {
    const localTime = new Date(date.toLocaleString('en-US', { timeZone }));
    const diff = date.getTime() - date.getMilliseconds() - localTime.getTime();
    return new Date(date.getTime() + diff).toISOString();
  }
  return date?.toISOString() || null;
}

export const getTimeZoneName = (timeZone: string): string => {
  const rawTimeZoneName = DateTime.now().setZone(timeZone).toFormat('z');
  // Only add GMT prefix to raw time differences and not acronyms such as PST.
  const needsGMT =
    rawTimeZoneName.includes('+') || rawTimeZoneName.includes('-');
  return `${needsGMT ? 'GMT' : ''}${rawTimeZoneName}`;
};

export const displayTimeInLocalTimezone = ({
  isoDate,
  format,
  displayTimezone,
  timeZone,
  timeZoneToDisplay,
}: DisplayDateParams) => {
  if (isoDate) {
    const timeZoneName = getTimeZoneName(
      timeZoneToDisplay || timeZone || 'UTC',
    );
    const dateString = DateTime.fromISO(isoDate)
      .setZone(timeZone || 'UTC')
      .toFormat(format);

    return `${dateString}${displayTimezone ? ` ${timeZoneName}` : ''}`;
  }
  return isoDate;
};

// The following functions are used to trick Chart.js
// In general Chart.js converts dates and displays them to user's local time zone
// If for example a date is equal to 2021-01-01T22:19:01 in site's local time then
// this must be converted to user's 2021-01-01T22:19:01 local time.

const userLocalTimeZoneName = Intl.DateTimeFormat().resolvedOptions().timeZone;

/**
 * Converts site's local time to user's local time
 * @param isotTime - Site's local time in ISO format
 * @param timeZone - Site's time zone
 */
export const convertToLocalTime = (
  isoTime: string,
  timeZone?: string | null,
) => {
  // Hold only hour info ignoring the timezone
  const dateStringIgnoreTimeZone = DateTime.fromISO(isoTime)
    .setZone(timeZone || 'UTC')
    .toFormat('yyyy-MM-dd HH:mm:ss');

  // Set the user's local time zone to the above datestring
  return zonedTimeToUtc(
    dateStringIgnoreTimeZone,
    userLocalTimeZoneName,
  ).toISOString();
};

export const convertSofarDataToLocalTime =
  (timeZone?: string | null) =>
  (sofarData?: ValueWithTimestamp[]): ValueWithTimestamp[] =>
    (sofarData || []).map((item) => ({
      ...item,
      timestamp: convertToLocalTime(item.timestamp, timeZone),
    }));

export const convertSurveyDataToLocalTime = (
  surveys: SurveyListItem[],
  timeZone?: string | null,
): SurveyListItem[] =>
  surveys.map((survey) => ({
    ...survey,
    diveDate: survey.diveDate
      ? convertToLocalTime(survey.diveDate, timeZone)
      : survey.diveDate,
  }));

// Generate data for all months between start date's previous month and
// end date's next month
export const generateHistoricalMonthlyMeanTimestamps = (
  historicalMonthlyMean: HistoricalMonthlyMean[],
  startDate?: string,
  endDate?: string,
  timeZone?: string | null,
): HistoricalMonthlyMeanData[] => {
  if (historicalMonthlyMean.length < 12) {
    return [];
  }

  const firstDate = (startDate ? DateTime.fromISO(startDate) : DateTime.now())
    .setZone(timeZone || 'UTC')
    .minus({ months: 1 })
    .set({ day: 15 })
    .startOf('day');

  const lastDate = (endDate ? DateTime.fromISO(endDate) : DateTime.now())
    .setZone(timeZone || 'UTC')
    .plus({ months: 1 })
    .set({ day: 15 })
    .startOf('day');

  const monthsRange = createRange(
    lastDate.diff(firstDate, 'months').months + 1,
  );

  return monthsRange.map((months) => {
    const date = firstDate.plus({ months });

    return {
      date: date.toISOString(),
      value: historicalMonthlyMean[date.month - 1].temperature,
    };
  });
};

export const rangeOverlapWithRange = (
  minDate1: string,
  maxDate1: string,
  minDate2: string,
  maxDate2: string,
) => {
  return (
    (minDate2 <= minDate1 && minDate1 <= maxDate2) ||
    (minDate2 <= maxDate1 && maxDate1 <= maxDate2)
  );
};
