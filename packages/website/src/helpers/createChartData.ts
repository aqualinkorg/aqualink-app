export const createChartData = (
  labels: string[],
  dataArray: number[],
  gradiendPercenage: number,
  fill: boolean
) => (canvas: HTMLCanvasElement) => {
  const ctx = canvas.getContext("2d");
  let gradient;
  if (ctx) {
    gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, "rgba(22, 141, 189, 0.29)");
    gradient.addColorStop(gradiendPercenage, "rgba(22, 141, 189, 0)");
  }

  return {
    labels,
    datasets: [
      {
        label: "overflow-dataset",
        data: dataArray,
        fill,
        borderColor: "#168dbd",
        borderWidth: 1.5,
        pointBackgroundColor: "#ffffff",
        pointBorderWidth: 1.5,
        pointRadius: 3,
        cubicInterpolationMode: "monotone",
      },
      {
        label: "gradient-dataset",
        data: dataArray,
        backgroundColor: gradient,
        borderColor: "#168dbd",
        pointBackgroundColor: "#ffffff",
        pointBorderWidth: 0,
        pointRadius: 0,
        cubicInterpolationMode: "monotone",
      },
    ],
  };
};
