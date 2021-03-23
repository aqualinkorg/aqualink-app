import { minBy, maxBy, meanBy } from "lodash";
import moment from "moment";

import { MonthlyMaxData, SofarValue } from "../../../store/Reefs/types";
import { CardColumn } from "./types";

export const calculateCardMetrics = (
  data?: (MonthlyMaxData | SofarValue)[],
  keyPrefix?: string
): CardColumn["rows"] => [
  {
    key: `${keyPrefix}-max`,
    value: data?.[1] ? maxBy(data, "value")?.value : undefined,
  },
  {
    key: `${keyPrefix}-mean`,
    value: data?.[1] ? meanBy(data, "value") : undefined,
  },
  {
    key: `${keyPrefix}-min`,
    value: data?.[1] ? minBy(data, "value")?.value : undefined,
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
    case diffDays < 3 * week:
      return "day";
    case diffDays < 3 * month:
      return "week";
    default:
      return "month";
  }
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
