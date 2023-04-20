import {
  getSofarDataClosestToDate,
  sameDay,
} from '../../../common/Chart/utils';
import {
  DailyData,
  ValueWithTimestamp,
  TimeSeries,
} from '../../../store/Sites/types';

const getSensorValue = (data?: ValueWithTimestamp[], date?: string | null) =>
  date && data?.[0]
    ? getSofarDataClosestToDate(data, new Date(date), 6)?.value
    : undefined;

export const getCardTemperatureValues = (
  dailyData: DailyData[],
  bottomTemperature: TimeSeries | undefined,
  topTemperature: TimeSeries | undefined,
  date: string | null | undefined,
) => {
  const surfaceData = date
    ? dailyData.find((item) => sameDay(date, item.date))
    : undefined;

  return {
    spotterBottom:
      getSensorValue(bottomTemperature?.spotter?.data, date) ??
      surfaceData?.avgBottomTemperature,
    spotterTop:
      getSensorValue(topTemperature?.spotter?.data, date) ??
      surfaceData?.topTemperature,
    hoboBottom: getSensorValue(bottomTemperature?.hobo?.data, date),
    hoboSurface: getSensorValue(topTemperature?.hobo?.data, date),
  };
};
