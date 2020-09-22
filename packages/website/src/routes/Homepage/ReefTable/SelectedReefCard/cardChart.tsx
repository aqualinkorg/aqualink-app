import React, { useState, useEffect, useCallback, useRef } from "react";
import { Line } from "react-chartjs-2";

import { createChartData } from "../../../../helpers/createChartData";
import { sortByDate } from "../../../../helpers/sortDailyData";
import type { DailyData } from "../../../../store/Reefs/types";
import {
  createDatasets,
  calculateAxisLimits,
} from "../../../ReefRoutes/Reef/Charts/utils";

import "../../../../helpers/backgroundPlugin";
import "../../../../helpers/fillPlugin";
import "chartjs-plugin-annotation";

const CardChart = ({
  dailyData,
  temperatureThreshold,
  maxMonthlyMean,
}: CardChartProps) => {
  const [updateChart, setUpdateChart] = useState<boolean>(false);
  const chartRef = useRef<Line>(null);
  const [xTickShift, setXTickShift] = useState<number>(0);

  // Sort daily data by date
  const sortedDailyData = sortByDate(dailyData, "date");

  const { surfaceTemperatureData } = createDatasets(sortedDailyData);

  const {
    xAxisMax,
    xAxisMin,
    yAxisMax,
    yAxisMin,
    chartLabels,
  } = calculateAxisLimits(sortedDailyData, temperatureThreshold);

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

  const onResize = useCallback(() => {
    setUpdateChart(true);
    setTimeout(() => {
      setUpdateChart(false);
    }, 1);
  }, []);

  // Update chart and set temperature threshold position when window is resized
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
      options={{
        maintainAspectRatio: false,
        plugins: {
          chartJsPluginBarchartBackground: {
            color: "rgb(158, 166, 170, 0.07)",
            xTicksFontWeight: 2.8,
          },
          fillPlugin: {
            datasetIndex: 0,
            zeroLevel: temperatureThreshold,
            bottom: 0,
            top: 35,
            color: "rgba(250, 141, 0, 1)",
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
                enabled: false,
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
                unit: "month",
              },
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
                  return `${value}\u00B0 `;
                },
              },
            },
          ],
        },
      }}
      height={100}
      data={createChartData(chartLabels, surfaceTemperatureData, true)}
    />
  );
};

interface CardChartProps {
  dailyData: DailyData[];
  temperatureThreshold: number | null;
  maxMonthlyMean: number | null;
}

export default CardChart;
