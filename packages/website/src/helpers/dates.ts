import { DailyData, Range, SpotterData } from "../store/Reefs/types";
import { sortByDate } from "./sortDailyData";

export const subtractFromDate = (endDate: string, amount: Range): string => {
  const date = new Date(endDate);
  const day = 1000 * 60 * 60 * 24;
  switch (amount) {
    case "day":
      return new Date(date.setTime(date.getTime() - 1 * day)).toISOString();
    case "week":
      return new Date(date.setTime(date.getTime() - 7 * day)).toISOString();
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
      return "day";
    default:
      return "day";
  }
};
