import moment from "moment";

import { getSpotterDataClosestToDate } from "../../../common/Chart/utils";
import {
  DailyData,
  HoboData,
  SofarValue,
  SpotterData,
} from "../../../store/Reefs/types";

const getSensorValue = (data?: SofarValue[], date?: string | null) =>
  date && data?.[0]
    ? getSpotterDataClosestToDate(data, new Date(date), 6)?.value
    : undefined;

export const getCardTemperatureValues = (
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

  return {
    satelliteTemperature: surfaceData?.satelliteTemperature,
    spotterBottom: getSensorValue(spotterData?.bottomTemperature, date),
    spotterSurface: getSensorValue(spotterData?.surfaceTemperature, date),
    hoboBottom: getSensorValue(hoboData?.bottomTemperature, date),
    hoboSurface: getSensorValue(hoboData?.surfaceTemperature, date),
  };
};
