import type { ChartProps } from "./index";
import { sortByDate } from "../../helpers/sortDailyData";
import {
  calculateAxisLimits,
  createDatasets,
} from "../../routes/ReefRoutes/Reef/Charts/utils";

export function useProcessedChartData(
  dailyData: ChartProps["dailyData"],
  temperatureThreshold: ChartProps["temperatureThreshold"]
) {
  // Sort daily data by date
  const sortedDailyData = sortByDate(dailyData, "date");

  const datasets = createDatasets(sortedDailyData);

  const axisLimits = calculateAxisLimits(sortedDailyData, temperatureThreshold);
  return { sortedDailyData, ...axisLimits, ...datasets };
}
