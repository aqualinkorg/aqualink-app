export const createChartData = (
  labels: string[],
  tempWithSurvey: (number | null)[],
  dataArray: number[],
  fill: boolean
  // TODO - use pointRadius to display survey dates
  // pointRadius: number,
) => ({
  labels,
  datasets: [
    {
      type: "scatter",
      label: "SURVEYS",
      data: tempWithSurvey,
      pointRadius: 4,
      backgroundColor: "#ffffff",
      pointBorderWidth: 2.5,
    },
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
  ],
});
