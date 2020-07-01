import React, { useRef, useState } from "react";
import {
  withStyles,
  WithStyles,
  createStyles,
  Typography,
} from "@material-ui/core";
import { Line } from "react-chartjs-2";

require("../../../../helpers/backgroundPlugin");
require("../../../../helpers/fillPlugin");

const Charts = ({ classes }: ChartsProps) => {
  const chartRef = useRef<Line>(null);
  const [state, setState] = useState({
    top: 0,
    left: 0,
    date: "",
    value: 0,
  });
  const [showTooltip, setShowTooltip] = useState<boolean>(false);

  const data = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext("2d");
    const threshold = 33;
    let gradient;
    if (ctx) {
      gradient = ctx.createLinearGradient(0, 0, 0, 400);
      gradient.addColorStop(0, "rgba(22, 141, 189, 0.29)");
      gradient.addColorStop(0.6, "rgba(22, 141, 189, 0)");
    }

    const dataArray = [32.4, 32.7, 32.5, 32.7, 32.7, 33.5, 34.1, 34.3];
    const thresholdArray = Array(8).fill(threshold);

    return {
      labels: [
        "MAY 1",
        "MAY 2",
        "MAY 3",
        "MAY 4",
        "MAY 5",
        "MAY 6",
        "MAY 7",
        "MAY 8",
      ],
      datasets: [
        {
          label: "Mean Water Temperature",
          data: dataArray,
          borderColor: "rgba(75,192,192,1)",
          borderWidth: 1.5,
          pointBackgroundColor: "#ffffff",
          pointBorderWidth: 1.5,
          pointRadius: 3,
          cubicInterpolationMode: "monotone",
        },
        {
          label: "Mean Water Temperatures",
          data: dataArray,
          backgroundColor: gradient,
          borderColor: "rgba(75,192,192,1)",
          pointBackgroundColor: "#ffffff",
          pointBorderWidth: 0,
          pointRadius: 0,
          cubicInterpolationMode: "monotone",
        },
        {
          label: "Mean",
          fill: false,
          data: thresholdArray,
          backgroundColor: "#FA8D00",
          borderColor: "#212121",
          borderDash: [8, 5],
          borderWidth: 1,
          pointRadius: 0,
          pointHoverRadius: 0,
        },
      ],
    };
  };

  return (
    <div className={classes.root}>
      <Typography
        style={{ marginLeft: "4rem", fontWeight: "normal" }}
        variant="h6"
      >
        MEAN DAILY WATER TEMPERATURE AT 25M (C&deg;)
      </Typography>
      <Line
        ref={chartRef}
        options={{
          plugins: {
            chartJsPluginBarchartBackground: {
              color: "rgb(158, 166, 170, 0.07)",
              mode: "odd",
            },
            fillPlugin: {
              datasetIndex: 0,
              zeroLevel: 33,
              bottom: 27,
              color: "rgba(250, 141, 0, 1)",
            },
          },
          tooltips: {
            filter: (tooltipItem: any) => {
              return tooltipItem.datasetIndex === 0;
            },
            enabled: false,
            custom: (tooltipModel: any) => {
              const chart = chartRef.current;
              if (!chart) {
                return;
              }
              if (showTooltip) {
                setShowTooltip(false);
                return;
              }
              const position = chart.chartInstance.canvas.getBoundingClientRect();
              const left = position.left + tooltipModel.caretX - 20;
              const top = position.top + tooltipModel.caretY - 10;
              const date =
                tooltipModel.dataPoints[0] && tooltipModel.dataPoints[0].xLabel;
              const value =
                tooltipModel.dataPoints[0] && tooltipModel.dataPoints[0].yLabel;
              setState({ top, left, date, value });
              setShowTooltip(true);
            },
          },
          legend: {
            display: false,
          },
          scales: {
            xAxes: [
              {
                ticks: {
                  padding: 10,
                  labelOffset: -100,
                },
                gridLines: {
                  display: false,
                },
              },
            ],
            yAxes: [
              {
                display: true,
                ticks: {
                  steps: 4,
                  min: 27,
                  stepSize: 1,
                  max: 35,
                  callback: (value: number) => {
                    if (value % 2 === 1) {
                      return `    ${value}\u00B0`;
                    }
                    return null;
                  },
                },
              },
            ],
          },
        }}
        height={65}
        data={data}
      />
      {showTooltip ? (
        <div
          onMouseLeave={() => setShowTooltip(false)}
          className="chart-tooltip"
          style={{
            backgroundColor: "#404b6b",
            opacity: 0.9,
            position: "fixed",
            top: state.top,
            left: state.left,
          }}
        >
          Tooltip
        </div>
      ) : null}
    </div>
  );
};

const styles = () =>
  createStyles({
    root: {
      height: "100%",
    },
  });

type ChartsProps = WithStyles<typeof styles>;

export default withStyles(styles)(Charts);
