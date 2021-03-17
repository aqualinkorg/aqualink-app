import moment from "moment";

import { getSpotterDataClosestToDate } from "../../../common/Chart/utils";
import { DailyData, HoboData, SpotterData } from "../../../store/Reefs/types";

export const getCardSensorValues = (
  dailyData: DailyData[],
  spotterData: SpotterData | null | undefined,
  hoboData: HoboData | undefined,
  date: string | null | undefined,
  timeZone: string | null | undefined
) => {
  const surfaceData = dailyData.find(
    (item) =>
      moment(item.date)
        .tz(timeZone || "UTC")
        .format("MM/DD/YYYY") ===
      moment(date)
        .tz(timeZone || "UTC")
        .format("MM/DD/YYYY")
  );

  const spotterBottom =
    date && spotterData && spotterData.bottomTemperature.length > 0
      ? getSpotterDataClosestToDate(
          spotterData.bottomTemperature,
          new Date(date),
          6
        )?.value
      : undefined;
  const spotterSurface =
    date && spotterData && spotterData.surfaceTemperature.length > 0
      ? getSpotterDataClosestToDate(
          spotterData.surfaceTemperature,
          new Date(date),
          6
        )?.value
      : undefined;

  const hoboBottom =
    date && hoboData && hoboData.bottomTemperature.length > 0
      ? getSpotterDataClosestToDate(
          hoboData.bottomTemperature,
          new Date(date),
          6
        )?.value
      : undefined;

  const hoboSurface =
    date && hoboData && hoboData.surfaceTemperature.length > 0
      ? getSpotterDataClosestToDate(
          hoboData.surfaceTemperature,
          new Date(date),
          6
        )?.value
      : undefined;

  return {
    satelliteTemperature: surfaceData?.satelliteTemperature,
    spotterBottom,
    spotterSurface,
    hoboBottom,
    hoboSurface,
  };
};
