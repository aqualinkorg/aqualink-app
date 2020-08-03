export const createChartData = (
  labels: string[],
  dataArray: number[],
  gradientPercenage: number,
  pointRadius: number,
  fill: boolean,
  title: string
) => (canvas: HTMLCanvasElement) => {
  const ctx = canvas.getContext("2d");
  let gradient;
  if (ctx) {
    gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, "rgba(22, 141, 189, 0.29)");
    gradient.addColorStop(gradientPercenage, "rgba(22, 141, 189, 0)");
  }

  return {
    labels,
    datasets: [
      {
        label: "BLEACHING THRESHOLD",
        data: dataArray,
        fill,
        borderColor: "#6bc1e1",
        borderWidth: 2,
        pointBackgroundColor: "#ffffff",
        pointBorderWidth: 1.5,
        pointRadius,
        cubicInterpolationMode: "monotone",
      },
      {
        label: title,
        data: dataArray,
        backgroundColor: "rgb(107,193,225,0.4)",
        borderColor: "#6bc1e1",
        borderWidth: 2,
        pointBackgroundColor: "#ffffff",
        pointBorderWidth: 0,
        pointRadius: 0,
        cubicInterpolationMode: "monotone",
      },
    ],
  };
};
