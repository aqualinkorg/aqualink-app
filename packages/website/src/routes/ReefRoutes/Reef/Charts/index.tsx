import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  withStyles,
  WithStyles,
  createStyles,
  Typography,
  Grid,
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
import "../../../../helpers/thresholdPlugin";

const Charts = ({ classes, dailyData, temperatureThreshold }: ChartsProps) => {
  const temperatureChartRef = useRef<Line>(null);
  const chartHeight = 60;
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [tooltipData, setTooltipData] = useState<TooltipData>({
    date: "",
    bottomTemperature: 0,
    surfaceTemperature: 0,
    wind: 0,
    windDirection: 0,
    wave: 0,
    wavePeriod: 0,
    waveDirection: 0,
  });
  const [showTooltip, setShowTooltip] = useState<boolean>(false);
  const [updateChart, setUpdateChart] = useState<boolean>(false);
  const [sliceAtLabel, setSliceAtLabel] = useState<string | null>(null);

  // Sort daily data by date
  const sortByDate = sortDailyData(dailyData);

  const {
    bottomTemperatureData,
    surfaceTemperatureData,
    windSpeedData,
    waveHeightData,
  } = createDatasets(sortByDate);

  const { xAxisMax, xAxisMin, chartLabels } = calculateAxisLimits(sortByDate);

  const customTooltip = (ref: React.RefObject<Line>) => (tooltipModel: any) => {
    const chart = ref.current;
    if (!chart) {
      return;
    }
    if (showTooltip) {
      setShowTooltip(false);
      return;
    }
    const position = chart.chartInstance.canvas.getBoundingClientRect();
    const left = position.left + tooltipModel.caretX - 120;
    const top = position.bottom - 300;
    const date =
      tooltipModel.dataPoints &&
      tooltipModel.dataPoints[0] &&
      tooltipModel.dataPoints[0].xLabel;
    const index = date && chartLabels.findIndex((item) => item === date);
    if (index > -1) {
      setTooltipPosition({ top, left });
      setTooltipData({
        date,
        bottomTemperature: bottomTemperatureData[index],
        surfaceTemperature: surfaceTemperatureData[index],
        wind: windSpeedData[index],
        windDirection: sortByDate[index].windDirection,
        wave: waveHeightData[index],
        wavePeriod: sortByDate[index].wavePeriod,
        waveDirection: sortByDate[index].waveDirection,
      });
      setShowTooltip(true);
      setSliceAtLabel(date);
    }
  };

  const onResize = useCallback(() => {
    setUpdateChart(true);
    setTimeout(() => {
      setUpdateChart(false);
    }, 1);
  }, []);

  // Update chart when window is resized
  useEffect(() => {
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, [onResize]);

  return (
    <Grid item xs={10}>
      <div className={classes.root}>
        <Typography className={classes.graphTitle} variant="h6">
          DAILY WATER TEMPERATURE (C&deg;)
        </Typography>
        <Line
          ref={temperatureChartRef}
          options={{
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
              thresholdPlugin: {
                threshold: temperatureThreshold,
              },
            },
            tooltips: {
              filter: (tooltipItem: any) => {
                return tooltipItem.datasetIndex === 0;
              },
              enabled: false,
              custom: customTooltip(temperatureChartRef),
            },
            legend: {
              display: true,
              rtl: true,
              labels: {
                fontSize: 14,
                fontStyle: "normal",
                fontColor: "#9ea6aa",
              },
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
                    display: false,
                    min: xAxisMin,
                    max: xAxisMax,
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
                    stepSize: 5,
                    max: 40,
                    callback: (value: number) => {
                      return `  ${value}\u00B0   `;
                    },
                  },
                },
              ],
            },
          }}
          height={chartHeight}
          data={createChartData(
            chartLabels,
            surfaceTemperatureData,
            0.6,
            5,
            true,
            "SURFACE TEMP"
          )}
        />
        {showTooltip ? (
          <div
            onMouseLeave={() => {
              setShowTooltip(false);
              setSliceAtLabel(null);
            }}
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
              <div className="tooltip-arrow" />
            </>
          </div>
        ) : null}
      </div>
    </Grid>
  );
};

const styles = () =>
  createStyles({
    root: {
      height: "100%",
    },
    graphTitle: {
      fontWeight: "normal",
      fontStretch: "normal",
      fontStyle: "normal",
      lineHeight: 1.5,
      letterSpacing: "normal",
      marginLeft: "4rem",
    },
  });

interface ChartsIncomingProps {
  dailyData: Data[];
  temperatureThreshold: number | null;
}

type ChartsProps = ChartsIncomingProps & WithStyles<typeof styles>;

export default withStyles(styles)(Charts);
