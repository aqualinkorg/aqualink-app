import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  withStyles,
  WithStyles,
  createStyles,
  Theme,
  Typography,
} from "@material-ui/core";
import { Line } from "react-chartjs-2";

import Tooltip, { TooltipData } from "./Tooltip";
import type { Data } from "../../../../store/Reefs/types";
import { createChartData } from "../../../../helpers/createChartData";
import { sortDailyData } from "../../../../helpers/sortDailyData";
import { createDatasets, calculateAxisLimits } from "./utils";
import "../../../../helpers/backgroundPlugin";
import "../../../../helpers/fillPlugin";
import "../../../../helpers/slicePlugin";
import "chartjs-plugin-annotation";

const Charts = ({
  classes,
  depth,
  dailyData,
  temperatureThreshold,
  maxMonthlyMean,
}: ChartsProps) => {
  const temperatureChartRef = useRef<Line>(null);
  const chartHeight = 60;
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [tooltipData, setTooltipData] = useState<TooltipData>({
    date: "",
    depth,
    bottomTemperature: null,
    surfaceTemperature: 0,
  });
  const [showTooltip, setShowTooltip] = useState<boolean>(false);
  const [updateChart, setUpdateChart] = useState<boolean>(false);
  const [sliceAtLabel, setSliceAtLabel] = useState<string | null>(null);
  const [xTickShift, setXTickShift] = useState<number>(0);

  // Sort daily data by date
  const sortByDate = sortDailyData(dailyData);

  const { bottomTemperatureData, surfaceTemperatureData } = createDatasets(
    sortByDate
  );

  const {
    xAxisMax,
    xAxisMin,
    yAxisMin,
    yAxisMax,
    chartLabels,
  } = calculateAxisLimits(sortByDate, temperatureThreshold);

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

  const changeXTickShift = () => {
    const { current } = temperatureChartRef;
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

  // Hide tooltip on scroll to avoid dragging it on the page.
  if (showTooltip) {
    window.addEventListener("scroll", hideTooltip);
  }

  return (
    <div className={classes.root} onMouseLeave={hideTooltip}>
      <Typography className={classes.graphTitle} variant="h6">
        DAILY WATER TEMPERATURE (°C)
      </Typography>
      <Line
        ref={temperatureChartRef}
        options={{
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
            sliceDrawPlugin: {
              sliceAtLabel,
              datasetIndex: 0,
            },
          },
          tooltips: {
            filter: (tooltipItem: any) => {
              return tooltipItem.datasetIndex === 0;
            },
            intersect: false,
            enabled: false,
            custom: customTooltip(temperatureChartRef),
          },
          legend: {
            display: true,
            rtl: true,
            labels: {
              fontSize: 14,
              fontColor: "#9ea6aa",
            },
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
                  content: "Maximum Monthly Temperature",
                },
              },
              {
                type: "line",
                mode: "horizontal",
                scaleID: "y-axis-0",
                value: temperatureThreshold,
                borderColor: "#ff8d00",
                borderWidth: 2,
                borderDash: [5, 5],
                label: {
                  backgroundColor: "rgb(169,169,169)",
                  enabled: false,
                  position: "left",
                  xAdjust: 10,
                  content: "Bleaching Threshold",
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
        }}
        height={chartHeight}
        data={createChartData(chartLabels, surfaceTemperatureData, true)}
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
          <>
            <Tooltip {...tooltipData} />
          </>
        </div>
      ) : null}
    </div>
  );
};

const styles = (theme: Theme) =>
  createStyles({
    root: {
      height: "16rem",
    },
    graphTitle: {
      lineHeight: 1.5,
      marginLeft: "4rem",

      [theme.breakpoints.down("xs")]: {
        marginLeft: 0,
      },
    },
  });

interface ChartsIncomingProps {
  dailyData: Data[];
  temperatureThreshold: number | null;
  maxMonthlyMean: number | null;
  depth: number | null;
}

type ChartsProps = ChartsIncomingProps & WithStyles<typeof styles>;

export default withStyles(styles)(Charts);
