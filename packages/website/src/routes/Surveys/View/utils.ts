import {
  getSofarDataClosestToDate,
  sameDay,
} from "../../../common/Chart/utils";
import { DailyData, SofarValue, TimeSeries } from "../../../store/Reefs/types";

const getSensorValue = (data?: SofarValue[], date?: string | null) =>
  date && data?.[0]
    ? getSofarDataClosestToDate(data, new Date(date), 6)?.value
    : undefined;

export const getCardTemperatureValues = (
  dailyData: DailyData[],
  spotterData: TimeSeries | undefined,
  hoboData: TimeSeries | undefined,
  date: string | null | undefined
) => {
  const surfaceData = date
    ? dailyData.find((item) => sameDay(date, item.date))
    : undefined;

  return {
    satelliteTemperature: surfaceData?.satelliteTemperature,
    spotterBottom: getSensorValue(spotterData?.bottomTemperature, date),
    spotterSurface: getSensorValue(spotterData?.surfaceTemperature, date),
    hoboBottom: getSensorValue(hoboData?.bottomTemperature, date),
    hoboSurface: getSensorValue(hoboData?.surfaceTemperature, date),
  };
};
