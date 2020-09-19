import React from "react";
import type { Data } from "../../../../store/Reefs/types";

import Chart from "../../../../common/Chart";

const CardChart = ({ ...rest }: CardChartProps) => {
  // TODO temp until its confirmed this component is no longer needed.
  return <Chart {...rest} />;
};

interface CardChartProps {
  dailyData: Data[];
  temperatureThreshold: number | null;
  maxMonthlyMean: number | null;
}

export default CardChart;
