const { Chart } = require('react-chartjs-2');
/**
 * Adds the subtle alternating rectangles in the background of the chart
 */
const plugin = {
  id: 'chartJsPluginBarchartBackground',
  beforeDraw(chart: any, _easingValue: any, options: any) {
    const xScale = chart.scales['x-axis-0'];
    const ticksPositions = xScale.ticks.map((_: any, index: number) =>
      xScale.getPixelForTick(index),
    );
    const { ctx, chartArea } = chart;
    const chartHeight = chartArea.bottom - chartArea.top;
    const chartWidth = chartArea.right - chartArea.left;
    const day = 1;
    ctx.save();
    // eslint-disable-next-line fp/no-mutation
    ctx.fillStyle = options.color;
    if (options.xTicksFontWeight) {
      // eslint-disable-next-line no-param-reassign,fp/no-mutation
      chart.scales['x-axis-0'].options.ticks.fontSize =
        (chartWidth * options.xTicksFontWeight) / 100;
    }
    const nTicks = ticksPositions.length;
    // eslint-disable-next-line fp/no-mutation
    for (let i = 0; i < nTicks; i += day) {
      // Color every other day
      if (i % 2 === 0) {
        const start = ticksPositions[i];
        if (i + day < nTicks) {
          // If next day does not exceed the chart area, then color a one day range
          const end = ticksPositions[i + day];
          ctx.fillRect(start, chartArea.top, end - start, chartHeight);
        } else {
          // If next day exceeds the chart area, color to chart's right edge
          ctx.fillRect(
            start,
            chartArea.top,
            chartArea.right - start,
            chartHeight,
          );
        }
      }
    }
    ctx.restore();
  },
};

export default plugin;
Chart.pluginService.register(plugin);
