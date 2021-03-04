import { min, max, mean, minBy, maxBy, meanBy } from "lodash";
import moment from "moment";

import {
  DailyData,
  SofarValue,
  SpotterData,
} from "../../../../store/Reefs/types";
import { formatNumber } from "../../../../helpers/numberUtils";

export const calculateCardMetrics = (
  dailyData: DailyData[],
  spotterData: SpotterData | null | undefined,
  hoboBottomTemperature: SofarValue[],
  error: boolean
) => {
  const satelliteSurface = dailyData.map((item) => item.satelliteTemperature);
  const { bottomTemperature: spotterBottomTemperature } = spotterData || {};
  const hasSpotterData =
    !error && spotterData && spotterData.bottomTemperature.length > 1;
  const hasHoboData = !error && hoboBottomTemperature.length > 1;
  const hasDailyData = !error && dailyData.length > 0;

  const hasLoggerData = hasSpotterData || hasHoboData;

  const bottomTemperature =
    hasLoggerData && hasHoboData
      ? hoboBottomTemperature
      : spotterBottomTemperature;

  const minSurface = hasDailyData
    ? formatNumber(min(satelliteSurface), 1)
    : "- -";
  const maxSurface = hasDailyData
    ? formatNumber(max(satelliteSurface), 1)
    : "- -";
  const meanSurface = hasDailyData
    ? formatNumber(mean(satelliteSurface), 1)
    : "- -";

  const minBottom = bottomTemperature
    ? formatNumber(minBy(bottomTemperature, (item) => item.value)?.value, 1)
    : "- -";
  const maxBottom = bottomTemperature
    ? formatNumber(maxBy(bottomTemperature, (item) => item.value)?.value, 1)
    : "- -";
  const meanBottom = bottomTemperature
    ? formatNumber(
        meanBy(bottomTemperature, (item) => item.value),
        1
      )
    : "- -";

  return {
    minSurface,
    maxSurface,
    meanSurface,
    minBottom,
    maxBottom,
    meanBottom,
  };
};

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
