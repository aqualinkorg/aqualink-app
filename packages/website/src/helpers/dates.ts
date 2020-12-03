import { DailyData, Range, SpotterData } from "../store/Reefs/types";
import { SurveyListItem } from "../store/Survey/types";
import { sortByDate } from "./sortDailyData";

type DateString = string | null | undefined;

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
      timeZone,
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
  data: SpotterData,
  timeZone?: string | null
): SpotterData => ({
  bottomTemperature: data.bottomTemperature.map((item) => ({
    ...item,
    timestamp: convertToLocalTime(item.timestamp, timeZone) || item.timestamp,
  })),
  surfaceTemperature: data.surfaceTemperature.map((item) => ({
    ...item,
    timestamp: convertToLocalTime(item.timestamp, timeZone) || item.timestamp,
  })),
});

export const convertSurveysToLocalTime = (
  surveys: SurveyListItem[],
  timeZone?: string | null
): SurveyListItem[] =>
  surveys.map((item) => ({
    ...item,
    diveDate: convertToLocalTime(item.diveDate, timeZone) || item.diveDate,
  }));
