import { minBy, maxBy, meanBy } from "lodash";
import moment from "moment";
import {
  findMarginalDate,
  generateMonthlyMaxTimestamps,
} from "../../../helpers/dates";

import {
  DailyData,
  MonthlyMax,
  MonthlyMaxData,
  SofarValue,
  TimeSeriesData,
} from "../../../store/Reefs/types";
import {
  filterDailyData,
  filterMaxMonthlyData,
  filterSofarData,
  filterTimeSeriesData,
} from "../utils";
import { CardColumn } from "./types";

export const calculateCardMetrics = (
  minNumberOfPoints: number,
  data?: (MonthlyMaxData | SofarValue)[],
  keyPrefix?: string
): CardColumn["rows"] => [
  {
    key: `${keyPrefix}-max`,
    value: data?.[minNumberOfPoints - 1]
      ? maxBy(data, "value")?.value
      : undefined,
  },
  {
    key: `${keyPrefix}-mean`,
    value: data?.[minNumberOfPoints - 1] ? meanBy(data, "value") : undefined,
  },
  {
    key: `${keyPrefix}-min`,
    value: data?.[minNumberOfPoints - 1]
      ? minBy(data, "value")?.value
      : undefined,
  },
];

// Show at least 3 ticks on the chart
export const findChartPeriod = (startDate: string, endDate: string) => {
  const from = moment(new Date(startDate).toISOString());
  const to = moment(new Date(endDate).toISOString());
  const week = 7;
  const month = 30;
  const diffDays = to.diff(from, "days");

  switch (true) {
    case diffDays < 2:
      return "hour";
    case diffDays < 3 * week:
      return "day";
    case diffDays < 3 * month:
      return "week";
    default:
      return "month";
  }
};

export const findDataLimits = (
  monthlyMax: MonthlyMax[],
  dailyData: DailyData[] | undefined,
  timeSeriesData: TimeSeriesData | undefined,
  startDate: string | undefined,
  endDate: string | undefined
): [string | undefined, string | undefined] => {
  const { hobo, spotter } = timeSeriesData || {};
  const maxMonthlyData = generateMonthlyMaxTimestamps(
    monthlyMax,
    startDate,
    endDate
  );
  const filteredMaxMonthlyData = filterMaxMonthlyData(
    maxMonthlyData,
    startDate,
    endDate
  );
  const filteredDailyData = filterDailyData(
    dailyData || [],
    startDate,
    endDate
  );
  const filteredHoboData = filterSofarData(
    hobo?.bottomTemperature || [],
    startDate,
    endDate
  );
  const filteredSpotterData = filterTimeSeriesData(spotter, startDate, endDate);

  const hasData = Boolean(
    filteredMaxMonthlyData?.[0] ||
      filteredDailyData?.[0] ||
      filteredSpotterData?.bottomTemperature?.[0] ||
      filteredSpotterData?.topTemperature?.[0] ||
      filteredHoboData?.[0]
  );

  return [
    hasData
      ? new Date(
          findMarginalDate(
            filteredMaxMonthlyData,
            filteredDailyData,
            filteredSpotterData,
            filteredHoboData,
            "min"
          )
        ).toISOString()
      : undefined,
    hasData
      ? new Date(
          findMarginalDate(
            filteredMaxMonthlyData,
            filteredDailyData,
            filteredSpotterData,
            filteredHoboData
          )
        ).toISOString()
      : undefined,
  ];
};

/**
 * Determines if the input dates differ by more than one year
 * @param startDate - The starting date
 * @param endDate - The ending date
 */
export const moreThanOneYear = (startDate: string, endDate: string) => {
  const from = moment(startDate);
  const to = moment(endDate);
  return to.diff(from, "years") >= 1;
};
