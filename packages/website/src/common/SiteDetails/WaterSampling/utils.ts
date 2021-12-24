import { compact, mapValues, minBy, meanBy } from "lodash";
import { DataRange, Metrics, TimeSeriesData } from "../../../store/Sites/types";

export const findSondeDataMinAndMaxDates = (
  ranges?: Partial<Record<Metrics, DataRange[]>>
) => {
  const minDate = minBy(
    compact(Object.values(ranges || {}).map((range) => range?.[0]?.minDate)),
    (date) => new Date(date).getTime()
  );

  const maxDate = minBy(
    compact(Object.values(ranges || {}).map((range) => range?.[0]?.maxDate)),
    (date) => new Date(date).getTime()
  );

  return { minDate, maxDate };
};

export const calculateSondeDataMeanValues = (
  sondeData?: TimeSeriesData["sonde"]
) => mapValues(sondeData, (data) => meanBy(data, "value"));
