/* eslint-disable no-param-reassign */
const { Chart } = require("react-chartjs-2");

const defaultOptions = {
  color: "#f3f3f3",
  axis: "category",
  mode: "odd",
};

function getLineValue(scale: any, index: any, offsetGridLines: any) {
  // see core.scale.js -> getLineValue
  let lineValue = scale.getPixelForTick(index);

  if (offsetGridLines) {
    if (index === 0) {
      lineValue -= (scale.getPixelForTick(1) - lineValue) / 2;
    } else {
      lineValue -= (lineValue - scale.getPixelForTick(index - 1)) / 2;
    }
  }
  return lineValue;
}

const plugin = {
  id: "chartJsPluginBarchartBackground",

  hasData(data: any) {
    return data && data.datasets && data.datasets.length > 0;
  },

  findScale(chart: any, options: any) {
    const scales = Object.keys(chart.scales).map((d) => chart.scales[d]);
    if (options.axis === "category") {
      return scales.find(
        (d) => d.type === "hierarchical" || d.type === "category"
      );
    }
    return scales.find((d) => d.id.startsWith(options.axis));
  },

  beforeDraw(chart: any, _easingValue: any, options: any) {
    options = { ...defaultOptions, ...options };

    const scale = this.findScale(chart, options);
    if (!this.hasData(chart.config.data) || !scale) {
      return;
    }
    const ticks = scale.getTicks();
    if (!ticks || ticks.length === 0) {
      return;
    }

    const isHorizontal = scale.isHorizontal();
    const { chartArea } = chart;

    const soptions = scale.options;
    const { gridLines } = soptions;

    // push the current canvas state onto the stack
    const { ctx } = chart;
    ctx.save();

    // set background color
    ctx.fillStyle = options.color;

    // based on core.scale.js
    const tickPositions = ticks.map((_: any, index: number) =>
      getLineValue(scale, index, gridLines.offsetGridLines && ticks.length > 1)
    );

    const shift = options.mode === "odd" ? 0 : 1;
    if (tickPositions.length % 2 === 1 - shift) {
      // add the right border as artifical one
      tickPositions.push(isHorizontal ? chartArea.right : chartArea.bottom);
    }

    if (isHorizontal) {
      const chartHeight = chartArea.bottom - chartArea.top;
      for (let i = shift; i < tickPositions.length; i += 2) {
        const x = tickPositions[i];
        const x2 = tickPositions[i + 1];
        ctx.fillRect(x, chartArea.top, x2 - x, chartHeight);
      }
    } else {
      const chartWidth = chartArea.right - chartArea.left;
      for (let i = shift; i < tickPositions.length; i += 2) {
        const y = tickPositions[i];
        const y2 = tickPositions[i + 1];
        ctx.fillRect(chartArea.left, y, chartWidth, y2 - y);
      }
    }

    // restore the saved state
    ctx.restore();
  },
};

export default plugin;
Chart.pluginService.register(plugin);
