import moment from "moment-timezone";
import { DailyData, Range, SpotterData } from "../store/Reefs/types";
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

// Returns the same date but for a different time zone
export const setTimeZone = (date: Date | null, timeZone?: string | null) => {
  if (date && timeZone) {
    const localTime = new Date(date.toLocaleString("en-US", { timeZone }));
    const diff = date.getTime() - localTime.getTime();
    return new Date(date.getTime() + diff).toISOString();
  }
  return date;
};

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

const userLocalTimeZoneOffset = new Date().getTimezoneOffset();

/**
 * Converts site's local time to user's local time
 * @param isotTime - Site's local time in ISO format
 * @param timeZone - Site's time zone
 */
export const convertToLocalTime = (
  isoTime: string,
  timeZone?: string | null
) => {
  // E.g. isoTime = 2021-01-01T22:19:01.000Z, timeZone = "America/New_York", userLocalTimeZoneOffset = -120 (Europe/Athens)

  // siteLocalTime = 2021-01-01T17:19:01-05:00
  const siteLocalTime = moment(isoTime)
    .tz(timeZone || "UTC")
    .format();

  // siteLocalIgnoreTimeZone = 2021-01-01T17:19:01-05:00
  const siteLocalIgnoreTimeZone = `${siteLocalTime.substring(0, 19)}.000Z`;

  // userLocalTime = 2021-01-01T15:19:01-02:00
  const userLocalTime = moment(siteLocalIgnoreTimeZone)
    .utcOffset(userLocalTimeZoneOffset)
    .format();

  // userLocalTime = 021-01-01T15:19:01.000Z
  const userLocalIgnoreTimeZone = `${userLocalTime.substring(0, 19)}.000Z`;

  // This value going to be interpreted as 2021-01-01T17:19:01
  // in user's local time zone from Chart.js, which is exactly what
  // we want
  return userLocalIgnoreTimeZone;
};

export const convertDailyDataToLocalTime = (
  dailyData: DailyData[],
  timeZone?: string | null
): DailyData[] =>
  dailyData.map((item) => ({
    ...item,
    date: convertToLocalTime(item.date, timeZone),
  }));

export const convertSpotterDataToLocalTime = (
  spotterData: SpotterData,
  timeZone?: string | null
): SpotterData => ({
  bottomTemperature: spotterData.bottomTemperature.map((item) => ({
    ...item,
    timestamp: convertToLocalTime(item.timestamp, timeZone),
  })),
  surfaceTemperature: spotterData.surfaceTemperature.map((item) => ({
    ...item,
    timestamp: convertToLocalTime(item.timestamp, timeZone),
  })),
});

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
