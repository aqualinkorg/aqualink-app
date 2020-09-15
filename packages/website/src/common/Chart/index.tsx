import React, { useRef } from "react";
import { Line } from "react-chartjs-2";

import type { Data } from "../../store/Reefs/types";

import "../../helpers/backgroundPlugin";
import "../../helpers/fillPlugin";
import "../../helpers/slicePlugin";

interface ChartProps {
  dailyData: Data[];
  temperatureThreshold: number | null;

  maxMonthlyMean?: number | null;
  depth?: number | null;
}

function Chart({
  dailyData,
  maxMonthlyMean,
  temperatureThreshold,
  depth,
}: ChartProps) {
  const temperatureChartRef = useRef<Line>(null);
  console.log(maxMonthlyMean, temperatureThreshold, depth);
  // TODO
  // tooltip as children, Line options, etc
  return <Line ref={temperatureChartRef} data={dailyData} />;
}
Chart.defaultProps = {
  maxMonthlyMean: null,
  depth: null,
};

export default Chart;
