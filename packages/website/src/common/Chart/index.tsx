import React, {
  CSSProperties,
  MutableRefObject,
  PropsWithChildren,
  RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Line } from "react-chartjs-2";
import { merge } from "lodash";
import type { Data } from "../../store/Reefs/types";

import "../../helpers/backgroundPlugin";
import "../../helpers/fillPlugin";
import "../../helpers/slicePlugin";
import Tooltip, {
  TooltipData,
} from "../../routes/ReefRoutes/Reef/Charts/Tooltip";
import { sortByDate } from "../../helpers/sortDailyData";
import {
  calculateAxisLimits,
  createDatasets,
} from "../../routes/ReefRoutes/Reef/Charts/utils";
import { createChartData } from "../../helpers/createChartData";

export type ChartDataRef = MutableRefObject<{
  chartRef: RefObject<Line>;
  sortedDailyData: ReturnType<typeof sortByDate>;
  datasets: ReturnType<typeof createDatasets>;
  axisLimits: ReturnType<typeof calculateAxisLimits>;
} | null>;
export interface ChartProps {
  dailyData: Data[];
  temperatureThreshold: number | null;
  maxMonthlyMean?: number | null;

  chartHeight?: number;
  chartSettings?: {};
  chartDataRef?: ChartDataRef;
}

function Chart({
  dailyData,
  temperatureThreshold,
  maxMonthlyMean = temperatureThreshold ? temperatureThreshold - 1 : null,
  chartHeight = 100,
  chartSettings = {},
  chartDataRef,
}: ChartProps) {
  const chartRef = useRef<Line>(null);

  const [updateChart, setUpdateChart] = useState<boolean>(false);

  const [xTickShift, setXTickShift] = useState<number>(0);

  // Sort daily data by date
  const sortedDailyData = sortByDate(dailyData, "date");

  const datasets = createDatasets(sortedDailyData);
  const { surfaceTemperatureData } = datasets;
  const axisLimits = calculateAxisLimits(sortedDailyData, temperatureThreshold);
  const { xAxisMax, xAxisMin, yAxisMax, yAxisMin, chartLabels } = axisLimits;

  if (chartDataRef)
    // eslint-disable-next-line no-param-reassign
    chartDataRef.current = { chartRef, sortedDailyData, datasets, axisLimits };

  const changeXTickShift = () => {
    const { current } = chartRef;
    if (current) {
      const xScale = current.chartInstance.scales["x-axis-0"];
      const ticksPositions = xScale.ticks.map((_: any, index: number) =>
        xScale.getPixelForTick(index)
      );
      setXTickShift((ticksPositions[2] - ticksPositions[1]) / 2);
    }
  };

  /*
    Catch the "window done resizing" event as suggested by https://css-tricks.com/snippets/jquery/done-resizing-event/
  */
  const onResize = useCallback(() => {
    setUpdateChart(true);
    setTimeout(() => {
      // Resize has stopped so stop updating the chart
      setUpdateChart(false);
      changeXTickShift();
    }, 1);
  }, []);

  // Update chart when window is resized
  useEffect(() => {
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, [onResize]);

  useEffect(() => {
    changeXTickShift();
  });

  return (
    <Line
      ref={chartRef}
      options={merge(
        {
          maintainAspectRatio: false,
          plugins: {
            chartJsPluginBarchartBackground: {
              color: "rgb(158, 166, 170, 0.07)",
            },
            fillPlugin: {
              datasetIndex: 0,
              zeroLevel: temperatureThreshold,
              bottom: 0,
              top: 35,
              color: "rgba(250, 141, 0, 0.5)",
              updateChart,
            },
          },
          tooltips: {
            enabled: false,
          },
          legend: {
            display: false,
          },

          annotation: {
            annotations: [
              {
                type: "line",
                mode: "horizontal",
                scaleID: "y-axis-0",
                value: maxMonthlyMean,
                borderColor: "rgb(75, 192, 192)",
                borderWidth: 2,
                borderDash: [5, 5],
                label: {
                  enabled: true,
                  backgroundColor: "rgb(169,169,169)",
                  position: "left",
                  xAdjust: 10,
                  content: "Historical Max",
                },
              },
            ],
          },
          scales: {
            xAxes: [
              {
                type: "time",
                time: {
                  displayFormats: {
                    hour: "MMM D h:mm a",
                  },
                  unit: "week",
                },
                display: true,
                ticks: {
                  labelOffset: xTickShift,
                  min: xAxisMin,
                  max: xAxisMax,
                  padding: 10,
                  maxRotation: 0,
                  callback: (value: string) => {
                    return value.split(", ")[0].toUpperCase();
                  },
                },
                gridLines: {
                  display: false,
                  drawTicks: false,
                },
              },
            ],
            yAxes: [
              {
                gridLines: {
                  drawTicks: false,
                },
                display: true,
                ticks: {
                  min: yAxisMin,
                  stepSize: 5,
                  max: yAxisMax,
                  callback: (value: number) => {
                    return `${value}\u00B0  `;
                  },
                },
              },
            ],
          },
        },
        chartSettings
      )}
      height={chartHeight}
      data={createChartData(chartLabels, surfaceTemperatureData, true)}
    />
  );
}
export default Chart;
