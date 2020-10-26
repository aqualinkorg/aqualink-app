import { SofarValue } from "../store/Reefs/types";

export const createChartData = (
  labels: string[],
  spotterBottom: SofarValue[],
  spotterSurface: SofarValue[],
  tempWithSurvey: (number | null)[],
  dataArray: number[],
  fill: boolean
  // TODO - use pointRadius to display survey dates
  // pointRadius: number,
) => {
  const data = {
    labels,
    datasets: [
      {
        type: "scatter",
        label: "SURVEYS",
        data: tempWithSurvey,
        pointRadius: 5,
        backgroundColor: "#ffffff",
        pointBackgroundColor: "#ffff",
        borderWidth: 1.5,
        borderColor: "#128cc0",
      },
      {
        label: "SURFACE TEMP",
        data: dataArray,
        backgroundColor: "rgb(107,193,225,0.2)",
        borderColor: "#6bc1e1",
        borderWidth: 2,
        pointBackgroundColor: "#ffffff",
        pointBorderWidth: 1.5,
        pointRadius: 0,
        cubicInterpolationMode: "monotone",
      },
      {
        label: "SPOTTER BOTTOM",
        data: spotterBottom.map((item) => ({
          x: item.timestamp,
          y: item.value,
        })),
        backgroundColor: "rgb(0,100,0,0.2)",
        borderColor: "#006400",
        borderWidth: 2,
        pointBackgroundColor: "#ffffff",
        pointBorderWidth: 1.5,
        pointRadius: 0,
        cubicInterpolationMode: "monotone",
      },
      {
        label: "SPOTTER SURFACE",
        data: spotterSurface.map((item) => ({
          x: item.timestamp,
          y: item.value,
        })),
        backgroundColor: "rgb(255,165,0,0.2)",
        borderColor: "#ffa500",
        borderWidth: 2,
        pointBackgroundColor: "#ffffff",
        pointBorderWidth: 1.5,
        pointRadius: 0,
        cubicInterpolationMode: "monotone",
      },
    ],
  };

  if (fill) {
    return {
      ...data,
      datasets: [
        data.datasets[0],
        {
          label: "BLEACHING THRESHOLD",
          data: dataArray,
          fill,
          borderColor: "#6bc1e1",
          borderWidth: 2,
          pointBackgroundColor: "#ffffff",
          pointBorderWidth: 1.5,
          pointRadius: 0,
          cubicInterpolationMode: "monotone",
        },
        data.datasets[1],
      ],
    };
  }
  return data;
};
