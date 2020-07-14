import React, { useState, useEffect, useCallback } from "react";
import { Line } from "react-chartjs-2";

import { createChartData } from "../../../helpers/createChartData";
import { sortDailyData } from "../../../helpers/sortDailyData";
import type { Data } from "../../../store/Reefs/types";

require("../../../helpers/backgroundPlugin");
require("../../../helpers/fillPlugin");

const CardChart = ({ dailyData, temperatureThreshold }: CardChartProps) => {
  const [updateChart, setUpdateChart] = useState<boolean>(false);

  const dailyDataLen = dailyData.length;
  // Sort daily data by date
  const sortByDate = sortDailyData(dailyData);
  const dates = sortByDate.map((item) => item.date);

  // Acquire bottom temperature data and append an extra value equal to the
  // temperature mean in order to make temperature chart continuous
  const bottomTemperatureData = sortByDate.map(
    (item) => item.avgBottomTemperature
  );
  const bottomTemperatureChartData = [
    ...bottomTemperatureData,
    bottomTemperatureData.reduce((a, b) => a + b) / dailyDataLen,
  ];

  const xAxisMax = new Date(
    new Date(dates[dailyDataLen - 1]).setHours(24, 0, 0, 0)
  ).toISOString();
  const xAxisMin = new Date(
    new Date(xAxisMax).setHours(-7 * 24, 0, 0, 0)
  ).toISOString();

  // Add an extra date one day after the final daily data date
  const chartLabels = [
    ...dates,
    new Date(new Date(xAxisMax).setHours(3, 0, 0, 0)).toISOString(),
  ];

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

  return (
    <>
      <Line
        options={{
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
          scales: {
            xAxes: [
              {
                type: "time",
                time: {
                  displayFormats: {
                    hour: "MMM D h:mm a",
                  },
                },
                ticks: {
                  min: xAxisMin,
                  max: xAxisMax,
                  padding: 10,
                  maxRotation: 0,
                  callback: (value: string) => {
                    const splitDate = value.split(" ");
                    if (splitDate[2] === "12:00" && splitDate[3] === "pm") {
                      return `${splitDate[0]} ${splitDate[1]}`;
                    }
                    return null;
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
                  min: 0,
                  stepSize: 20,
                  max: 40,
                  callback: (value: number) => {
                    return `${value}\u00B0 `;
                  },
                },
              },
            ],
          },
        }}
        height={100}
        data={createChartData(
          chartLabels,
          bottomTemperatureChartData,
          0.6,
          0,
          true
        )}
      />
    </>
  );
};

interface CardChartProps {
  dailyData: Data[];
  temperatureThreshold: number | null;
}

export default CardChart;
