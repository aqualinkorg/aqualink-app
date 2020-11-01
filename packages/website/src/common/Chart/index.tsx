import React, {
  MutableRefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Line } from "react-chartjs-2";
import { mergeWith } from "lodash";
import type { DailyData } from "../../store/Reefs/types";
import "./plugins/backgroundPlugin";
import "./plugins/fillPlugin";
import "./plugins/slicePlugin";
import "chartjs-plugin-annotation";
import { createChartData, useProcessedChartData } from "./utils";
import { SurveyListItem } from "../../store/Survey/types";

export interface ChartProps {
  dailyData: DailyData[];
  surveys: SurveyListItem[];
  temperatureThreshold: number | null;
  maxMonthlyMean: number | null;

  chartSettings?: {};
  chartRef?: MutableRefObject<Line | null>;
}

const SMALL_WINDOW = 400;

const makeAnnotation = (
  name: string,
  value: number | null,
  borderColor: string,
  backgroundColor = "rgb(169,169,169, 0.7)"
) => ({
  type: "line",
  mode: "horizontal",
  scaleID: "y-axis-0",
  value,
  borderColor,
  borderWidth: 2,
  borderDash: [5, 5],
  label: {
    enabled: true,
    backgroundColor,
    yPadding: 3,
    xPadding: 3,
    position: "left",
    xAdjust: 10,
    content: name,
  },
});

function Chart({
  dailyData,
  surveys,
  temperatureThreshold,
  maxMonthlyMean,
  chartSettings = {},
  chartRef: forwardRef,
}: ChartProps) {
  const chartRef = useRef<Line>(null);

  if (forwardRef) {
    // this might be doable with forwardRef or callbacks, but its a little hard since we need to
    // use it in two places
    // eslint-disable-next-line no-param-reassign
    forwardRef.current = chartRef.current;
  }
  const [updateChart, setUpdateChart] = useState<boolean>(true);

  const [xTickShift, setXTickShift] = useState<number>(0);

  const [xPeriod, setXPeriod] = useState<"week" | "month">("week");

  const yStepSize = 5;

  const {
    xAxisMax,
    xAxisMin,
    yAxisMax,
    yAxisMin,
    surfaceTemperatureData,
    bottomTemperatureData,
    tempWithSurvey,
    chartLabels,
  } = useProcessedChartData(dailyData, surveys, temperatureThreshold);

  const changeXTickShiftAndPeriod = () => {
    const { current } = chartRef;
    if (current) {
      // not sure why 'scales' doesn't have a type. Possibly from a plugin?
      const xScale = (current.chartInstance as any).scales["x-axis-0"];
      const ticksPositions = xScale.ticks.map((_: any, index: number) =>
        xScale.getPixelForTick(index)
      );
      if (xScale.width > SMALL_WINDOW) {
        setXTickShift((ticksPositions[2] - ticksPositions[1]) / 2);
        setXPeriod("week");
      } else {
        setXPeriod("month");
        setXTickShift(0);
      }
    }
  };

  // Catch the "window done resizing" event as suggested by https://css-tricks.com/snippets/jquery/done-resizing-event/
  const onResize = useCallback(() => {
    setUpdateChart(true);
    setTimeout(() => {
      // Resize has stopped so stop updating the chart
      setUpdateChart(false);
      changeXTickShiftAndPeriod();
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
    changeXTickShiftAndPeriod();
  });
  const settings = mergeWith(
    {
      layout: {
        padding: { right: 10 },
      },
      maintainAspectRatio: false,
      plugins: {
        chartJsPluginBarchartBackground: {
          color: "rgb(158, 166, 170, 0.07)",
        },
        fillPlugin: {
          datasetIndex: 1,
          zeroLevel: temperatureThreshold,
          bottom: 0,
          top: 35,
          color: "rgba(250, 141, 0, 0.5)",
          updateChart,
        },
      },
      tooltips: {
        enabled: false,
      },
      legend: {
        display: false,
      },

      annotation: {
        annotations: [
          makeAnnotation("Historical Max", maxMonthlyMean, "rgb(75, 192, 192)"),
          makeAnnotation(
            "Bleaching Threshold",
            temperatureThreshold,
            "#ff8d00"
          ),
        ],
      },
      scales: {
        xAxes: [
          {
            type: "time",
            time: {
              displayFormats: {
                week: "MMM D",
                month: "MMM",
              },
              unit: xPeriod,
            },
            display: true,
            ticks: {
              labelOffset: xTickShift,
              min: xAxisMin,
              max: xAxisMax,
              padding: 10,
              callback: (value: number, index: number, values: string[]) =>
                index === values.length - 1 ? undefined : value,
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
              stepSize: yStepSize,
              max: yAxisMax,
              callback: (value: number) => {
                if (![1, yStepSize - 1].includes(value % yStepSize)) {
                  return `${value}°  `;
                }
                return "";
              },
            },
          },
        ],
      },
    },
    chartSettings,
    // makes sure arrays are merged correctly
    (el: any, toMerge: any) => {
      if (Array.isArray(el)) {
        return el.concat(toMerge);
      }
      return undefined;
    }
  );
  return (
    <Line
      ref={chartRef}
      options={settings}
      data={createChartData(
        chartLabels,
        tempWithSurvey,
        surfaceTemperatureData,
        bottomTemperatureData,
        !!temperatureThreshold
      )}
    />
  );
}

export default Chart;
