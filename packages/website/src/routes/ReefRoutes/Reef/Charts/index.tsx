import React from "react";
import { withStyles, WithStyles, createStyles } from "@material-ui/core";
import { Line } from "react-chartjs-2";

const data = {
  labels: [
    "MAY 14",
    "MAY 15",
    "MAY 16",
    "MAY 17",
    "MAY 18",
    "MAY 19",
    "MAY 20",
  ],
  datasets: [
    {
      label: "MEAN DAILY WATER TEMPERATURE AT 25M (C\u00B0)",
      data: [32.1, 32.3, 32.4, 32.2, 32.5, 33.1, 33.3],
      backgroundColor: "rgba(75,192,192,0.2)",
      borderColor: "rgba(75,192,192,1)",
    },
    {
      label: "MEAN DAILY WIND SPEED (KPH)",
      data: [11.4, 12, 11.6, 11.3, 12.3, 12.6, 12],
      backgroundColor: "rgba(75,192,192,0.2)",
      borderColor: "rgba(75,192,192,1)",
    },
  ],
};

const Charts = ({ classes }: ChartsProps) => (
  <div className={classes.root}>
    <Line
      options={{
        legend: {
          position: "top",
          align: "start",
          fullWidth: false,
          labels: {
            boxWidth: 0,
            fontSize: 16,
            fontStyle: "bold",
            padding: 30,
          },
        },
        scales: {
          xAxes: [
            {
              ticks: {
                padding: 20,
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
                    return `${value}\u00B0`;
                  }
                  return null;
                },
              },
            },
          ],
        },
      }}
      height={65}
      data={{ labels: data.labels, datasets: [data.datasets[0]] }}
    />
    <Line
      options={{
        legend: {
          position: "top",
          align: "start",
          fullWidth: false,
          labels: {
            boxWidth: 0,
            fontSize: 16,
            fontStyle: "bold",
            padding: 30,
          },
        },
        scales: {
          xAxes: [
            {
              ticks: {
                padding: 20,
              },
            },
          ],
          yAxes: [
            {
              display: true,
              ticks: {
                steps: 4,
                min: 5,
                stepSize: 5,
                max: 15,
                callback: (value: number) => `${value}kph`,
              },
            },
          ],
        },
      }}
      height={45}
      data={{ labels: data.labels, datasets: [data.datasets[1]] }}
    />
  </div>
);

const styles = () =>
  createStyles({
    root: {
      height: "100%",
    },
  });

type ChartsProps = WithStyles<typeof styles>;

export default withStyles(styles)(Charts);
