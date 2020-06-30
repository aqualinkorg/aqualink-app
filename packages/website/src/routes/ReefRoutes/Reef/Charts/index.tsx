import React from "react";
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
          label: "Mean Water Temperature",
          data: dataArray,
          backgroundColor: gradient,
          borderColor: "rgba(75,192,192,1)",
          pointBackgroundColor: "#ffffff",
          pointBorderWidth: 0,
          pointRadius: 0,
          cubicInterpolationMode: "monotone",
        },
        {
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
        options={{
          plugins: {
            chartJsPluginBarchartBackground: {
              color: "rgb(158, 166, 170, 0.07)",
              mode: "odd",
            },
            fillPlugin: {
              datasetIndex: 0,
              zeroLevel: 33,
              color: "rgba(250, 141, 0, 1)",
            },
          },
          tooltips: {
            filter: (tooltipItem: any) => {
              return tooltipItem.datasetIndex === 0;
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
