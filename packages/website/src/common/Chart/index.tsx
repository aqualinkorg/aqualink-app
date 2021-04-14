import React, {
  MutableRefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
  memo,
} from "react";
import { Line } from "react-chartjs-2";
import { useSelector } from "react-redux";
import { mergeWith, isEqual } from "lodash";
import type {
  DailyData,
  HistoricalMonthlyMeanData,
  SofarValue,
  TimeSeries,
} from "../../store/Reefs/types";
import "./plugins/backgroundPlugin";
import "chartjs-plugin-annotation";
import {
  createChartData,
  useProcessedChartData,
  augmentSurfaceTemperature,
} from "./utils";
import { SurveyListItem } from "../../store/Survey/types";
import { surveyDetailsSelector } from "../../store/Survey/surveySlice";
import { Range } from "../../store/Reefs/types";
import { convertToLocalTime } from "../../helpers/dates";

export interface ChartProps {
  reefId: number;
  dailyData: DailyData[];
  spotterData?: TimeSeries;
  hoboBottomTemperatureData?: SofarValue[];
  historicalMonthlyMeanData?: HistoricalMonthlyMeanData[];
  timeZone?: string | null;
  startDate?: string;
  endDate?: string;
  chartPeriod?: "hour" | Range | null;
  surveys: SurveyListItem[];
  temperatureThreshold: number | null;
  maxMonthlyMean: number | null;
  background?: boolean;
  showYearInTicks?: boolean;

  chartSettings?: {};
  chartRef?: MutableRefObject<Line | null>;
}

const SMALL_WINDOW = 400;
const X_TICK_THRESHOLD = 90;

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

const returnMemoized = (prevProps: ChartProps, nextProps: ChartProps) =>
  isEqual(prevProps.dailyData, nextProps.dailyData) &&
  isEqual(
    prevProps.historicalMonthlyMeanData,
    nextProps.historicalMonthlyMeanData
  ) &&
  isEqual(
    prevProps.hoboBottomTemperatureData,
    nextProps.hoboBottomTemperatureData
  ) &&
  isEqual(
    prevProps.spotterData?.bottomTemperature,
    nextProps.spotterData?.bottomTemperature
  ) &&
  isEqual(
    prevProps.spotterData?.topTemperature,
    nextProps.spotterData?.topTemperature
  );

function Chart({
  dailyData,
  spotterData,
  hoboBottomTemperatureData,
  historicalMonthlyMeanData,
  surveys,
  timeZone,
  startDate,
  endDate,
  chartPeriod,
  temperatureThreshold,
  maxMonthlyMean,
  background,
  showYearInTicks,
  chartSettings = {},
  chartRef: forwardRef,
}: ChartProps) {
  const chartRef = useRef<Line>(null);
  const selectedSurvey = useSelector(surveyDetailsSelector);

  if (forwardRef) {
    // this might be doable with forwardRef or callbacks, but its a little hard since we need to
    // use it in two places
    // eslint-disable-next-line no-param-reassign
    forwardRef.current = chartRef.current;
  }

  const [xTickShift, setXTickShift] = useState<number>(0);

  const [xPeriod, setXPeriod] = useState<"week" | "month">("week");

  const [hideLastTick, setHideLastTick] = useState<boolean>(false);

  const {
    xAxisMax,
    xAxisMin,
    yAxisMax,
    yAxisMin,
    surfaceTemperatureData,
    tempWithSurvey,
    bottomTemperatureData,
    spotterBottom,
    spotterTop,
    hoboBottom,
    historicalMonthlyMeanTemp,
  } = useProcessedChartData(
    dailyData,
    spotterData,
    hoboBottomTemperatureData,
    historicalMonthlyMeanData,
    surveys,
    temperatureThreshold,
    startDate,
    endDate
  );

  const yStepSize = yAxisMax - yAxisMin > 6 ? 5 : 2;

  const changeXTickShiftAndPeriod = () => {
    const { current } = chartRef;
    if (current) {
      // not sure why 'scales' doesn't have a type. Possibly from a plugin?
      const xScale = (current.chartInstance as any).scales["x-axis-0"];
      const ticksPositions = xScale.ticks.map((_: any, index: number) =>
        xScale.getPixelForTick(index)
      );
      const nTicks = ticksPositions.length;
      const {
        chartArea: { right },
      } = current.chartInstance;
      // If last tick is too close to the chart's right edge then hide it
      if (right - ticksPositions[nTicks - 1] < X_TICK_THRESHOLD) {
        setHideLastTick(true);
      } else {
        setHideLastTick(false);
      }
      setXTickShift((ticksPositions[2] - ticksPositions[1]) / 2);
      if (xScale.width > SMALL_WINDOW) {
        setXPeriod("week");
      } else {
        setXPeriod("month");
      }
    }
  };

  // Catch the "window done resizing" event as suggested by https://css-tricks.com/snippets/jquery/done-resizing-event/
  const onResize = useCallback(() => {
    setTimeout(() => {
      // Resize has stopped so stop updating the chart
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
          color: background ? "rgb(158, 166, 170, 0.07)" : "#ffffff",
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
                week: `MMM D ${showYearInTicks ? "YY" : ""}`,
                month: `MMM ${showYearInTicks ? "YY" : ""}`,
              },
              unit: chartPeriod || xPeriod,
            },
            display: true,
            ticks: {
              labelOffset: xTickShift,
              min: startDate || xAxisMin,
              max: endDate || xAxisMax,
              padding: 10,
              callback: (value: number, index: number, values: string[]) =>
                index === values.length - 1 && hideLastTick ? undefined : value,
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
        spotterBottom,
        spotterTop,
        hoboBottom,
        tempWithSurvey,
        augmentSurfaceTemperature(
          surfaceTemperatureData,
          startDate || xAxisMin,
          endDate || xAxisMax
        ),
        bottomTemperatureData,
        historicalMonthlyMeanTemp,
        selectedSurvey?.diveDate
          ? new Date(convertToLocalTime(selectedSurvey?.diveDate, timeZone))
          : null,
        temperatureThreshold
      )}
    />
  );
}

export default memo(Chart, returnMemoized);
