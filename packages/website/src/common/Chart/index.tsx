import React, {
  CSSProperties,
  PropsWithChildren,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Line } from "react-chartjs-2";

import type { Data } from "../../store/Reefs/types";

import "../../helpers/backgroundPlugin";
import "../../helpers/fillPlugin";
import "../../helpers/slicePlugin";
import Tooltip, {
  TooltipData,
} from "../../routes/ReefRoutes/Reef/Charts/Tooltip";
import { sortByDate } from "../../helpers/sortDailyData";
import {
  calculateAxisLimits,
  createDatasets,
} from "../../routes/ReefRoutes/Reef/Charts/utils";
import { createChartData } from "../../helpers/createChartData";

interface ChartProps {
  dailyData: Data[];
  temperatureThreshold: number | null;
  // this rule doesn't support defining defaults in object destructuring
  // eslint-disable-next-line react/require-default-props
  maxMonthlyMean?: number | null;
  includeTooltip?: boolean;
  depth?: number | null;
  chartAnnotations?: object[];
  // eslint-disable-next-line react/require-default-props
  className?: string;
  // eslint-disable-next-line react/require-default-props
  style?: CSSProperties;
}

function Chart({
  dailyData,
  temperatureThreshold,
  includeTooltip, // TODO implement
  maxMonthlyMean = temperatureThreshold ? temperatureThreshold - 1 : null,
  depth = null,
  chartAnnotations,
  children,
  ...rest
}: PropsWithChildren<ChartProps>) {
  const temperatureChartRef = useRef<Line>(null);

  const chartHeight = 60;
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [tooltipData, setTooltipData] = useState<TooltipData>({
    date: "",
    depth,
    bottomTemperature: 0,
    surfaceTemperature: 0,
  });
  const [showTooltip, setShowTooltip] = useState<boolean>(false);
  const [updateChart, setUpdateChart] = useState<boolean>(false);
  const [sliceAtLabel, setSliceAtLabel] = useState<string | null>(null);
  const [xTickShift, setXTickShift] = useState<number>(0);

  // Sort daily data by date
  const sortedDailyData = sortByDate(dailyData, "date");

  const { bottomTemperatureData, surfaceTemperatureData } = createDatasets(
    sortedDailyData
  );

  const {
    xAxisMax,
    xAxisMin,
    yAxisMax,
    yAxisMin,
    chartLabels,
  } = calculateAxisLimits(sortedDailyData, temperatureThreshold);

  const customTooltip = (ref: React.RefObject<Line>) => (tooltipModel: any) => {
    const chart = ref.current;
    if (!chart) {
      return;
    }
    const position = chart.chartInstance.canvas.getBoundingClientRect();
    const left = position.left + tooltipModel.caretX - 100;
    const top = position.top + tooltipModel.caretY - 110;
    const date =
      tooltipModel.dataPoints &&
      tooltipModel.dataPoints[0] &&
      tooltipModel.dataPoints[0].xLabel;
    const index = date && chartLabels.findIndex((item) => item === date);
    if (index > -1) {
      setTooltipPosition({ top, left });
      setTooltipData({
        date,
        depth,
        bottomTemperature: bottomTemperatureData[index],
        surfaceTemperature: surfaceTemperatureData[index],
      });
      setShowTooltip(true);
      setSliceAtLabel(date);
    }
  };

  const hideTooltip = () => {
    setShowTooltip(false);
    setSliceAtLabel(null);
  };

  const changeXTickShift = () => {
    const { current } = temperatureChartRef;
    if (current) {
      const xScale = current.chartInstance.scales["x-axis-0"];
      const ticksPositions = xScale.ticks.map((_: any, index: number) =>
        xScale.getPixelForTick(index)
      );
      setXTickShift((ticksPositions[2] - ticksPositions[1]) / 2);
    }
  };

  /*
    Catch the "window done resizing" event as suggested by https://css-tricks.com/snippets/jquery/done-resizing-event/
  */
  const onResize = useCallback(() => {
    setUpdateChart(true);
    setTimeout(() => {
      // Resize has stopped so stop updating the chart
      setUpdateChart(false);
      changeXTickShift();
    }, 1);
  }, []);

  // Update chart when window is resized
  useEffect(() => {
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, [onResize]);

  useEffect(() => {
    changeXTickShift();
  });

  // Hide tooltip on scroll to avoid dragging it on the page.
  if (showTooltip) {
    window.addEventListener("scroll", hideTooltip);
  }

  return (
    <div {...rest} onMouseLeave={hideTooltip}>
      {children}
      <Line
        ref={temperatureChartRef}
        options={{
          maintainAspectRatio: false,
          plugins: {
            chartJsPluginBarchartBackground: {
              color: "rgb(158, 166, 170, 0.07)",
            },
            fillPlugin: {
              datasetIndex: 0,
              zeroLevel: temperatureThreshold,
              bottom: 0,
              top: 35,
              color: "rgba(250, 141, 0, 0.5)",
              updateChart,
            },
            sliceDrawPlugin: {
              sliceAtLabel,
              datasetIndex: 0,
            },
          },
          tooltips: {
            filter: (tooltipItem: any) => {
              return tooltipItem.datasetIndex === 0;
            },
            enabled: false,
            intersect: false,
            custom: customTooltip(temperatureChartRef),
          },
          legend: {
            display: true,
            rtl: true,
            labels: {
              fontSize: 14,
              fontColor: "#9ea6aa",
            },
          },
          annotation: {
            annotations: [
              {
                type: "line",
                mode: "horizontal",
                scaleID: "y-axis-0",
                value: maxMonthlyMean,
                borderColor: "rgb(75, 192, 192)",
                borderWidth: 2,
                borderDash: [5, 5],
                label: {
                  enabled: true,
                  backgroundColor: "rgb(169,169,169)",
                  position: "left",
                  xAdjust: 10,
                  content: "Historical Max",
                },
              },
              ...chartAnnotations,
            ],
          },
          scales: {
            xAxes: [
              {
                type: "time",
                time: {
                  displayFormats: {
                    hour: "MMM D h:mm a",
                  },
                  unit: "week",
                },
                display: true,
                ticks: {
                  labelOffset: xTickShift,
                  min: xAxisMin,
                  max: xAxisMax,
                  padding: 10,
                  maxRotation: 0,
                  callback: (value: string) => {
                    return value.split(", ")[0].toUpperCase();
                  },
                },
                gridLines: {
                  display: false,
                  drawTicks: false,
                },
              },
            ],
            yAxes: [
              {
                gridLines: {
                  drawTicks: false,
                },
                display: true,
                ticks: {
                  min: yAxisMin,
                  stepSize: 5,
                  max: yAxisMax,
                  callback: (value: number) => {
                    return `${value}\u00B0  `;
                  },
                },
              },
            ],
          },
        }}
        height={chartHeight}
        data={createChartData(chartLabels, surfaceTemperatureData, true)}
      />
      {showTooltip ? (
        <div
          className="chart-tooltip"
          id="chart-tooltip"
          style={{
            position: "fixed",
            top: tooltipPosition.top,
            left: tooltipPosition.left,
          }}
        >
          <Tooltip {...tooltipData} />
        </div>
      ) : null}
    </div>
  );
}
Chart.defaultProps = {
  includeTooltip: false,
  chartAnnotations: [],
};
export default Chart;
