import React from "react";
import {
  withStyles,
  WithStyles,
  createStyles,
  Typography,
} from "@material-ui/core";
import { Line } from "react-chartjs-2";

const data = (canvas: HTMLCanvasElement) => {
  const ctx = canvas.getContext("2d");
  let gradient;
  if (ctx) {
    gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, "rgba(22, 141, 189, 0.29)");
    gradient.addColorStop(0.5, "rgba(22, 141, 189, 0)");
  }

  const dataArray = Array.from({ length: 8 }, () => Math.random() * 3 + 31.5);

  const thresholdValue = 32.8;
  const thresholdArray = new Array(dataArray.length).fill(thresholdValue);
  const shaded = dataArray.map((elem) => Math.min(elem, thresholdValue));

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
        label: "MEAN DAILY WATER TEMPERATURE AT 25M (C\u00B0)",
        data: dataArray,
        backgroundColor: gradient,
        borderColor: "rgba(75,192,192,1)",
        pointBackgroundColor: "#ffffff",
        pointBorderWidth: 2,
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
      {
        fill: "-2",
        data: shaded,
        backgroundColor: "#FA8D00",
      },
    ],
  };
};

const Charts = ({ classes }: ChartsProps) => {
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
          legend: {
            display: false,
          },
          scales: {
            xAxes: [
              {
                ticks: {
                  padding: 10,
                  // labelOffset: 100,
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
