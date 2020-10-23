import { ChartComponentProps } from "react-chartjs-2";

export const createChartData = (
  labels: string[],
  tempWithSurvey: (number | null)[],
  surfaceTemps: number[],
  fill: boolean
  // TODO - use pointRadius to display survey dates
  // pointRadius: number,
) => {
  const data: ChartComponentProps["data"] = {
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
        data: surfaceTemps,
        backgroundColor: "rgb(107,193,225,0.2)",
        borderColor: "#6bc1e1",
        borderWidth: 2,
        pointBackgroundColor: "#ffffff",
        pointBorderWidth: 1.5,
        pointRadius: 0,
        cubicInterpolationMode: "monotone",
      },
    ],
  };

  if (fill) {
    // eslint-disable-next-line fp/no-mutating-methods
    data.datasets!.splice(1, 0, {
      label: "BLEACHING THRESHOLD",
      data: surfaceTemps,
      fill,
      borderColor: "#6bc1e1",
      borderWidth: 2,
      pointBackgroundColor: "#ffffff",
      pointBorderWidth: 1.5,
      pointRadius: 0,
      cubicInterpolationMode: "monotone",
    });
  }
  return data;
};
