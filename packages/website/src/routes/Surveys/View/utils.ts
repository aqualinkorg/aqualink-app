import { ValueWithTimestamp, TimeSeries } from 'store/Sites/types';
import { getSofarDataClosestToDate } from 'common/Chart/utils';

const getSensorValue = (data?: ValueWithTimestamp[], date?: string | null) =>
  date && data?.[0]
    ? getSofarDataClosestToDate(data, new Date(date), 6)?.value
    : undefined;

export const getCardTemperatureValues = (
  bottomTemperature: TimeSeries | undefined,
  topTemperature: TimeSeries | undefined,
  date: string | null | undefined,
) => ({
  spotterBottom: getSensorValue(
    bottomTemperature?.find((x) => x.type === 'spotter')?.data,
    date,
  ),
  spotterTop: getSensorValue(
    topTemperature?.find((x) => x.type === 'spotter')?.data,
    date,
  ),
  hoboBottom: getSensorValue(
    bottomTemperature?.find((x) => x.type === 'hobo')?.data,
    date,
  ),
  hoboSurface: getSensorValue(
    topTemperature?.find((x) => x.type === 'hobo')?.data,
    date,
  ),
});
