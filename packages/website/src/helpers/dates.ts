import moment from "moment-timezone";
import { DailyData, Range, SpotterData } from "../store/Reefs/types";
import { SurveyListItem } from "../store/Survey/types";
import { sortByDate } from "./sortDailyData";

type DateString = string | null | undefined;

interface DisplayDateParams {
  hourlyData: boolean;
  displayTimezone: boolean;
  date: DateString;
  timeZone?: string | null;
  options?: Intl.DateTimeFormatOptions;
}

export const subtractFromDate = (endDate: string, amount: Range): string => {
  const date = new Date(endDate);
  const day = 1000 * 60 * 60 * 24;
  switch (amount) {
    case "day":
      return new Date(date.setTime(date.getTime() - 1 * day)).toISOString();
    case "week":
    default:
      return new Date(date.setTime(date.getTime() - 7 * day)).toISOString();
  }
};

export const findMaxDate = (
  dailyData: DailyData[],
  spotterData: SpotterData
): string => {
  const combinedData = [
    ...dailyData,
    ...spotterData.surfaceTemperature.map((item) => ({
      date: item.timestamp,
      value: item.value,
    })),
  ];

  const sortedData = sortByDate(combinedData, "date", "desc");

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

// Converts a given date to a specified time zone
export const convertToLocalTime = (
  utcTime: DateString,
  timeZone?: string | null,
  options?: Intl.DateTimeFormatOptions
): DateString => {
  if (utcTime && timeZone) {
    return new Date(utcTime).toLocaleString("en-US", {
      ...options,
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      timeZone,
      timeZoneName: "short",
    });
  }
  return utcTime;
};

// Returns the same date but for a different time zone
export const setTimeZone = (date: Date | null, timeZone?: string | null) => {
  if (date && timeZone) {
    const localTime = new Date(date.toLocaleString("en-US", { timeZone }));
    const diff = date.getTime() - localTime.getTime();
    return new Date(date.getTime() + diff).toISOString();
  }
  return date;
};

export const convertDailyDataToLocalTime = (
  data: DailyData[],
  timeZone?: string | null
): DailyData[] =>
  data.map((item) => ({
    ...item,
    date: convertToLocalTime(item.date, timeZone) || item.date,
  }));

export const convertSpotterDataToLocalTime = (
  data?: SpotterData | null,
  timeZone?: string | null
): SpotterData | null | undefined => {
  if (data) {
    return {
      bottomTemperature: data.bottomTemperature.map((item) => ({
        ...item,
        timestamp:
          convertToLocalTime(item.timestamp, timeZone) || item.timestamp,
      })),
      surfaceTemperature: data.surfaceTemperature.map((item) => ({
        ...item,
        timestamp:
          convertToLocalTime(item.timestamp, timeZone) || item.timestamp,
      })),
    };
  }
  return data;
};

export const convertSurveysToLocalTime = (
  surveys: SurveyListItem[],
  timeZone?: string | null
): SurveyListItem[] =>
  surveys.map((item) => ({
    ...item,
    diveDate: convertToLocalTime(item.diveDate, timeZone) || item.diveDate,
  }));

export const getTimeZoneName = (timeZone: string): string => {
  const rawTimeZoneName = moment().tz(timeZone).format("z");
  // Only add GMT prefix to raw time differences and not acronyms such as PST.
  const needsGMT =
    rawTimeZoneName.includes("+") || rawTimeZoneName.includes("-");
  return `${needsGMT ? "GMT" : ""}${rawTimeZoneName}`;
};

export const displayTimeInLocalTimezone = ({
  hourlyData,
  displayTimezone,
  date,
  timeZone,
  options,
}: DisplayDateParams) => {
  if (date) {
    const timeZoneName = getTimeZoneName(timeZone || "UTC");
    const dateString = new Date(date).toLocaleString("en-US", {
      day: options?.day || "2-digit",
      month: options?.month || "2-digit",
      year: options?.year || "2-digit",
      ...(hourlyData
        ? {
            hour: options?.hour || "2-digit",
            minute: options?.minute || "2-digit",
          }
        : {}),
      timeZone: timeZone || "UTC",
    });

    return `${dateString} ${
      hourlyData && timeZoneName && displayTimezone ? timeZoneName : ""
    }`;
  }
  return date;
};

export const toRelativeTime = (timestamp?: string) => {
  if (timestamp) {
    const minute = 60;
    const hour = 60 * 60;
    const day = 60 * 60 * 24;

    const now = new Date().getTime();
    const start = new Date(timestamp).getTime();

    // Time period in seconds
    const timePeriod = Math.floor((now - start) / 1000);

    if (timePeriod < minute) {
      return `${timePeriod} sec. ago`;
    }
    if (timePeriod < hour) {
      return `${Math.floor(timePeriod / minute)} min. ago`;
    }
    if (timePeriod < day) {
      const hours = Math.floor(timePeriod / hour);
      return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    }
    const days = Math.floor(timePeriod / day);
    return `${days} day${days > 1 ? "s" : ""} ago`;
  }
  return null;
};
