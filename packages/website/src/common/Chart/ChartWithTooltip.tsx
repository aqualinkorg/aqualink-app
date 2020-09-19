import React, { PropsWithChildren, useRef, useState } from "react";
import { Line } from "react-chartjs-2";
import Chart, { ChartDataRef, ChartProps } from "./index";
import Tooltip, {
  TooltipData,
} from "../../routes/ReefRoutes/Reef/Charts/Tooltip";
import { sortByDate } from "../../helpers/sortDailyData";
import {
  calculateAxisLimits,
  createDatasets,
} from "../../routes/ReefRoutes/Reef/Charts/utils";

interface ChartWithTooltipProps extends ChartProps {
  depth: number | null;
}

function ChartWithTooltip({
  depth,
  dailyData,
  temperatureThreshold,
  children,
  ...rest
}: PropsWithChildren<ChartWithTooltipProps>) {
  const chartDataRef: ChartDataRef = useRef(null);

  // start dup
  // Sort daily data by date
  const sortedDailyData = sortByDate(dailyData, "date");

  const { bottomTemperatureData, surfaceTemperatureData } = createDatasets(
    sortedDailyData
  );

  const {
    xAxisMax,
    xAxisMin,
    yAxisMax,
    yAxisMin,
    chartLabels,
  } = calculateAxisLimits(sortedDailyData, temperatureThreshold);
  // end dup

  const [sliceAtLabel, setSliceAtLabel] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [tooltipData, setTooltipData] = useState<TooltipData>({
    date: "",
    depth,
    bottomTemperature: 0,
    surfaceTemperature: 0,
  });
  const [showTooltip, setShowTooltip] = useState<boolean>(false);

  const customTooltip = (ref: React.RefObject<Line>) => (tooltipModel: any) => {
    const chart = ref.current;
    if (!chart) {
      return;
    }
    const position = chart.chartInstance.canvas.getBoundingClientRect();
    const left = position.left + tooltipModel.caretX - 100;
    const top = position.top + tooltipModel.caretY - 110;
    const date =
      tooltipModel.dataPoints &&
      tooltipModel.dataPoints[0] &&
      tooltipModel.dataPoints[0].xLabel;
    const index = date && chartLabels.findIndex((item) => item === date);
    if (index > -1) {
      setTooltipPosition({ top, left });
      setTooltipData({
        date,
        depth,
        bottomTemperature: bottomTemperatureData[index],
        surfaceTemperature: surfaceTemperatureData[index],
      });
      setShowTooltip(true);
      setSliceAtLabel(date);
    }
  };

  const hideTooltip = () => {
    setShowTooltip(false);
    setSliceAtLabel(null);
  };
  // Hide tooltip on scroll to avoid dragging it on the page.
  if (showTooltip) {
    window.addEventListener("scroll", hideTooltip);
  }

  return (
    <div className="" style={{}} onMouseLeave={hideTooltip}>
      {children}
      <Chart
        chartDataRef={chartDataRef}
        dailyData={dailyData}
        temperatureThreshold={temperatureThreshold}
        chartHeight={60}
        chartSettings={{
          plugins: {
            sliceDrawPlugin: {
              sliceAtLabel,
              datasetIndex: 0,
            },
            tooltips: {
              filter: (tooltipItem: any) => {
                return tooltipItem.datasetIndex === 0;
              },
              enabled: false,
              intersect: false,
              custom: customTooltip(
                chartDataRef.current?.chartRef || { current: null }
              ),
            },
            legend: {
              display: true,
              rtl: true,
              labels: {
                fontSize: 14,
                fontColor: "#9ea6aa",
              },
            },
          },
        }}
      />
      {showTooltip ? (
        <div
          className="chart-tooltip"
          id="chart-tooltip"
          style={{
            position: "fixed",
            top: tooltipPosition.top,
            left: tooltipPosition.left,
          }}
        >
          <Tooltip {...tooltipData} />
        </div>
      ) : null}
    </div>
  );
}

export default ChartWithTooltip;
