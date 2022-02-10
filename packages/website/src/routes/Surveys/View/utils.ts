import {
  getSofarDataClosestToDate,
  sameDay,
} from "../../../common/Chart/utils";
import { DailyData, SofarValue, TimeSeries } from "../../../store/Sites/types";

const getSensorValue = (data?: SofarValue[], date?: string | null) =>
  date && data?.[0]
    ? getSofarDataClosestToDate(data, new Date(date), 6)?.value
    : undefined;

export const getCardTemperatureValues = (
  dailyData: DailyData[],
  bottomTemperature: TimeSeries | undefined,
  topTemperature: TimeSeries | undefined,
  date: string | null | undefined
) => {
  const surfaceData = date
    ? dailyData.find((item) => sameDay(date, item.date))
    : undefined;

  return {
    satelliteTemperature: surfaceData?.satelliteTemperature,
    spotterBottom: getSensorValue(bottomTemperature?.spotter?.data, date),
    spotterTop: getSensorValue(topTemperature?.spotter?.data, date),
    hoboBottom: getSensorValue(bottomTemperature?.hobo?.data, date),
    hoboSurface: getSensorValue(topTemperature?.hobo?.data, date),
  };
};
