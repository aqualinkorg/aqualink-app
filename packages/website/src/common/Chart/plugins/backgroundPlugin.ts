const { Chart } = require("react-chartjs-2");
/* eslint-disable fp/no-mutation,no-param-reassign */
const plugin = {
  id: "chartJsPluginBarchartBackground",
  beforeDraw(chart: any, _easingValue: any, options: any) {
    const xScale = chart.scales["x-axis-0"];
    const ticksPositions = xScale.ticks.map((_: any, index: number) =>
      xScale.getPixelForTick(index)
    );
    const { ctx, chartArea } = chart;
    const chartHeight = chartArea.bottom - chartArea.top;
    const chartWidth = chartArea.right - chartArea.left;
    const day = 1;
    ctx.save();
    ctx.fillStyle = options.color;
    if (options.xTicksFontWeight) {
      chart.scales["x-axis-0"].options.ticks.fontSize =
        (chartWidth * options.xTicksFontWeight) / 100;
    }
    for (let i = 0; i < ticksPositions.length; i += 2 * day) {
      const start = ticksPositions[i];
      const end = ticksPositions[i + day];
      ctx.fillRect(start, chartArea.top, end - start, chartHeight);
    }
    ctx.restore();
  },
};

export default plugin;
Chart.pluginService.register(plugin);
