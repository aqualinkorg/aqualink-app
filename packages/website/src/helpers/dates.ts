import moment from "moment-timezone";
import { range as createRange } from "lodash";
import { zonedTimeToUtc } from "date-fns-tz";

import {
  DailyData,
  HistoricalMonthlyMean,
  HistoricalMonthlyMeanData,
  Range,
  SofarValue,
  TimeSeries,
} from "../store/Reefs/types";
import { SurveyListItem } from "../store/Survey/types";
import { sortByDate } from "./sortDailyData";

type DateString = string | null | undefined;

interface DisplayDateParams {
  isoDate: DateString;
  format: string;
  displayTimezone: boolean;
  timeZone?: string | null;
  timeZoneToDisplay?: string | null;
}

export const isBefore = (start: string, end: string) =>
  new Date(start).getTime() <= new Date(end).getTime();

export const isBetween = (date: string, start: string, end: string) =>
  isBefore(date, end) && isBefore(start, date);

export const subtractFromDate = (
  endDate: string,
  amount: Range,
  multiple?: number
): string => {
  switch (amount) {
    case "day":
      return moment(endDate)
        .subtract(multiple || 1, "days")
        .toISOString();
    case "week":
      return moment(endDate)
        .subtract(multiple || 1, "weeks")
        .toISOString();
    case "month":
      return moment(endDate)
        .subtract(multiple || 1, "months")
        .toISOString();
    case "year":
      return moment(endDate)
        .subtract(multiple || 1, "years")
        .toISOString();
    default:
      return endDate;
  }
};

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
      return `${timePeriodInHours} hour${timePeriodInHours > 1 ? "s" : ""} ago`;
    default:
      return `${timePeriodInDays} day${timePeriodInDays > 1 ? "s" : ""} ago`;
  }
};

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
  spotterData?: TimeSeries,
  hoboBottomTemperature?: SofarValue[],
  type: "min" | "max" = "max"
): string => {
  const combinedData = [
    ...historicalMonthlyMeanData,
    ...dailyData,
    ...(spotterData?.topTemperature?.map((item) => ({
      date: item.timestamp,
      value: item.value,
    })) || []),
    ...(spotterData?.bottomTemperature?.map((item) => ({
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
    "date",
    type === "max" ? "desc" : "asc"
  );

  return sortedData[0].date;
};

export const findChartPeriod = (range: Range) => {
  switch (range) {
    case "day":
      return "hour";
    case "week":
    default:
      return "day";
  }
};

export function setTimeZone(date: Date, timeZone?: string | null): string;

export function setTimeZone(
  date: Date | null,
  timeZone?: string | null
): string | null;

// Returns the same date but for a different time zone
export function setTimeZone(date: Date | null, timeZone?: string | null) {
  if (date && timeZone) {
    const localTime = new Date(date.toLocaleString("en-US", { timeZone }));
    const diff = date.getTime() - localTime.getTime();
    return new Date(date.getTime() + diff).toISOString();
  }
  return date?.toISOString() || null;
}

export const getTimeZoneName = (timeZone: string): string => {
  const rawTimeZoneName = moment().tz(timeZone).format("z");
  // Only add GMT prefix to raw time differences and not acronyms such as PST.
  const needsGMT =
    rawTimeZoneName.includes("+") || rawTimeZoneName.includes("-");
  return `${needsGMT ? "GMT" : ""}${rawTimeZoneName}`;
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
      timeZoneToDisplay || timeZone || "UTC"
    );
    const dateString = moment(isoDate)
      .tz(timeZone || "UTC")
      .format(format);

    return `${dateString}${displayTimezone ? ` ${timeZoneName}` : ""}`;
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
  timeZone?: string | null
) => {
  // Hold only hour info ignoring the timezone
  const dateStringIgnoreTimeZone = moment(isoTime)
    .tz(timeZone || "UTC")
    .format("YYYY-MM-DD HH:mm:ss");

  // Set the user's local time zone to the above datestring
  return zonedTimeToUtc(
    dateStringIgnoreTimeZone,
    userLocalTimeZoneName
  ).toISOString();
};

export const convertDailyDataToLocalTime = (
  dailyData: DailyData[],
  timeZone?: string | null
): DailyData[] =>
  dailyData.map((item) => ({
    ...item,
    date: convertToLocalTime(item.date, timeZone),
  }));

export const convertSofarDataToLocalTime = (
  sofarData: SofarValue[],
  timeZone?: string | null
): SofarValue[] =>
  sofarData.map((item) => ({
    ...item,
    timestamp: convertToLocalTime(item.timestamp, timeZone),
  }));

export const convertTimeSeriesToLocalTime = (
  timeSeries?: TimeSeries,
  timeZone?: string | null
): TimeSeries | undefined => {
  if (!timeSeries) {
    return timeSeries;
  }
  return {
    alert: convertSofarDataToLocalTime(timeSeries.alert, timeZone),
    dhw: convertSofarDataToLocalTime(timeSeries.dhw, timeZone),
    satelliteTemperature: convertSofarDataToLocalTime(
      timeSeries.satelliteTemperature,
      timeZone
    ),
    topTemperature: convertSofarDataToLocalTime(
      timeSeries.topTemperature,
      timeZone
    ),
    bottomTemperature: convertSofarDataToLocalTime(
      timeSeries.bottomTemperature,
      timeZone
    ),
    sstAnomaly: convertSofarDataToLocalTime(timeSeries.sstAnomaly, timeZone),
    significantWaveHeight: convertSofarDataToLocalTime(
      timeSeries.significantWaveHeight,
      timeZone
    ),
    wavePeakPeriod: convertSofarDataToLocalTime(
      timeSeries.wavePeakPeriod,
      timeZone
    ),
    waveMeanDirection: convertSofarDataToLocalTime(
      timeSeries.waveMeanDirection,
      timeZone
    ),
    windSpeed: convertSofarDataToLocalTime(timeSeries.windSpeed, timeZone),
    windDirection: convertSofarDataToLocalTime(
      timeSeries.windDirection,
      timeZone
    ),
  };
};

export const convertSurveyDataToLocalTime = (
  surveys: SurveyListItem[],
  timeZone?: string | null
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
  timeZone?: string | null
): HistoricalMonthlyMeanData[] => {
  if (historicalMonthlyMean.length < 12) {
    return [];
  }

  const firstDate = moment(startDate)
    .tz(timeZone || "UTC")
    .subtract(1, "months")
    .set("date", 15)
    .startOf("day");
  const lastDate = moment(endDate)
    .tz(timeZone || "UTC")
    .add(1, "months")
    .set("date", 15)
    .startOf("day");

  const monthsRange = createRange(
    moment(lastDate).diff(moment(firstDate), "months") + 1
  );

  return monthsRange.map((months) => {
    const date = moment(firstDate).add(months, "months");

    return {
      date: date.toISOString(),
      value: historicalMonthlyMean[date.month()].temperature,
    };
  });
};
