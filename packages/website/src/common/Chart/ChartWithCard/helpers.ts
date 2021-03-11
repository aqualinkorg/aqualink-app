import { minBy, maxBy, meanBy } from "lodash";
import moment from "moment";

import {
  MonthlyMaxData,
  SofarValue,
  SpotterData,
} from "../../../store/Reefs/types";
import { formatNumber } from "../../../helpers/numberUtils";

export const calculateCardMetrics = (
  monthlyMaxData: MonthlyMaxData[],
  spotterData: SpotterData | null | undefined,
  hoboBottomTemperature: SofarValue[]
) => {
  const {
    bottomTemperature: spotterBottomTemperature,
    surfaceTemperature: spotterSurfaceTemperature,
  } = spotterData || {};

  const maxMonthlyMax = formatNumber(maxBy(monthlyMaxData, "value")?.value, 1);
  const meanMonthlyMax = formatNumber(meanBy(monthlyMaxData, "value"), 1);
  const minMonthlyMax = formatNumber(minBy(monthlyMaxData, "value")?.value, 1);

  const maxSpotterBottom = formatNumber(
    maxBy(spotterBottomTemperature, "value")?.value,
    1
  );
  const meanSpotterBottom = formatNumber(
    meanBy(spotterBottomTemperature, "value"),
    1
  );
  const minSpotterBottom = formatNumber(
    minBy(spotterBottomTemperature, "value")?.value,
    1
  );

  const maxSpotterSurface = formatNumber(
    maxBy(spotterSurfaceTemperature, "value")?.value,
    1
  );
  const meanSpotterSurface = formatNumber(
    meanBy(spotterSurfaceTemperature, "value"),
    1
  );
  const minSpotterSurface = formatNumber(
    minBy(spotterSurfaceTemperature, "value")?.value,
    1
  );

  const maxHoboBottom = formatNumber(
    maxBy(hoboBottomTemperature, "value")?.value,
    1
  );
  const meanHoboBottom = formatNumber(
    meanBy(hoboBottomTemperature, "value"),
    1
  );
  const minHoboBottom = formatNumber(
    minBy(hoboBottomTemperature, "value")?.value,
    1
  );

  return {
    maxMonthlyMax,
    meanMonthlyMax,
    minMonthlyMax,
    maxSpotterBottom,
    meanSpotterBottom,
    minSpotterBottom,
    maxSpotterSurface,
    meanSpotterSurface,
    minSpotterSurface,
    maxHoboBottom,
    meanHoboBottom,
    minHoboBottom,
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
