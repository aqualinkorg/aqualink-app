import { minBy, maxBy, meanBy } from "lodash";
import moment from "moment";

import { MonthlyMaxData, SofarValue } from "../../../store/Reefs/types";
import { CardColumn } from "./types";

export const calculateCardMetrics = (
  data?: (MonthlyMaxData | SofarValue)[],
  keyPrefix?: string
): CardColumn["rows"] => [
  { key: `${keyPrefix}-max`, value: maxBy(data, "value")?.value },
  { key: `${keyPrefix}-mean`, value: meanBy(data, "value") },
  { key: `${keyPrefix}-min`, value: minBy(data, "value")?.value },
];

// Show at least 3 ticks on the chart
export const findChartPeriod = (startDate: string, endDate: string) => {
  const from = moment(new Date(startDate).toISOString());
  const to = moment(new Date(endDate).toISOString());
  const week = 7;
  const month = 30;
  const diffDays = to.diff(from, "days");

  switch (true) {
    case diffDays < 3 * week:
      return "day";
    case diffDays < 3 * month:
      return "week";
    default:
      return "month";
  }
};

export const showYear = (startDate: string, endDate: string) => {
  const from = moment(new Date(startDate).toISOString());
  const to = moment(new Date(endDate).toISOString());
  return to.diff(from, "years") >= 1;
};
