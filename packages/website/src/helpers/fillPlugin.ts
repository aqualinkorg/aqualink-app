/* eslint-disable no-param-reassign */
const { Chart } = require("react-chartjs-2");

export const fillBetweenLinesPlugin = {
  id: "fillPlugin",

  afterDatasetsDraw: (chart: any, _easingValue: any, options: any) => {
    const max = Math.max.apply(
      null,
      chart.data.datasets[options.datasetIndex].data
    );
    const yScale = chart.scales["y-axis-0"];

    const top = yScale.getPixelForValue(max);
    const zero = yScale.getPixelForValue(options.zeroLevel);
    const bottom = yScale.getPixelForValue(27);

    const { ctx } = chart.chart;
    const gradient = ctx.createLinearGradient(0, top, 0, bottom);
    const ratio = Math.min((zero - top) / (bottom - top), 1);
    gradient.addColorStop(0, options.color);
    gradient.addColorStop(ratio, options.color);
    gradient.addColorStop(ratio, "rgba(0, 0, 0, 0)");
    gradient.addColorStop(1, "rgba(0,0,0,0)");
    chart.data.datasets[0].backgroundColor = gradient;
    chart.update();
  },
};

Chart.pluginService.register(fillBetweenLinesPlugin);
