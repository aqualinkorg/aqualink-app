import React, {
  CSSProperties,
  PropsWithChildren,
  useRef,
  useState,
} from "react";
import { Line } from "react-chartjs-2";
import type { ChartTooltipModel } from "chart.js";
import Chart, { ChartProps } from ".";
import Tooltip, { TooltipData } from "./Tooltip";
import {
  getDailyDataClosestToDate,
  getSpotterDataClosestToDate,
  findSurveyFromDate,
  sameDay,
} from "./utils";

export interface ChartWithTooltipProps extends ChartProps {
  depth: number | null;
  timeZone?: string | null;
  className?: string;
  style?: CSSProperties;
}

function ChartWithTooltip({
  depth,
  chartSettings,
  children,
  className,
  style,
  ...rest
}: PropsWithChildren<ChartWithTooltipProps>) {
  const { dailyData, spotterData, reefId } = rest;
  const chartDataRef = useRef<Line>(null);

  const [sliceAtLabel, setSliceAtLabel] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [tooltipData, setTooltipData] = useState<TooltipData>({
    reefId,
    date: "",
    depth,
    bottomTemperature: 0,
    spotterSurfaceTemp: null,
    surfaceTemperature: 0,
    surveyId: null,
  });
  const [showTooltip, setShowTooltip] = useState<boolean>(false);

  const customTooltip = (ref: React.RefObject<Line>) => (
    tooltipModel: ChartTooltipModel
  ) => {
    const chart = ref.current;
    if (!chart?.chartInstance.canvas) {
      return;
    }

    const date = tooltipModel.dataPoints?.[0]?.xLabel;
    if (typeof date !== "string") return;

    const surveyId = findSurveyFromDate(date, rest.surveys);

    const dailyDataForDate =
      // Try to find data on same day, else closest, else nothing.
      dailyData.filter((data) => sameDay(data.date, date))[0] ||
      getDailyDataClosestToDate(dailyData, new Date(date)) ||
      {};
    const { satelliteTemperature, avgBottomTemperature } = dailyDataForDate;

    const bottomTemp =
      spotterData &&
      getSpotterDataClosestToDate(
        spotterData.bottomTemperature,
        new Date(date),
        6
      )?.value;

    const spotterSurfaceTemp =
      (spotterData &&
        getSpotterDataClosestToDate(
          spotterData.surfaceTemperature,
          new Date(date),
          6
        )?.value) ||
      null;

    const bottomTemperature = bottomTemp || avgBottomTemperature;

    const nValues = [
      satelliteTemperature,
      bottomTemperature,
      spotterSurfaceTemp,
    ].filter(Boolean).length;

    const position = chart.chartInstance.canvas.getBoundingClientRect();
    const left = position.left + tooltipModel.caretX - 95;
    const top =
      position.top +
      tooltipModel.caretY -
      ((surveyId ? nValues + 1 : nValues) * 30 + 48);

    if (
      [satelliteTemperature, bottomTemperature, spotterSurfaceTemp].some(
        Boolean
      )
    ) {
      setTooltipPosition({ top, left });
      setTooltipData({
        ...tooltipData,
        date,
        depth,
        bottomTemperature,
        spotterSurfaceTemp,
        surfaceTemperature: satelliteTemperature,
        surveyId,
      });
      setShowTooltip(true);
      setSliceAtLabel(date);
    }
  };

  const hideTooltip = () => {
    setShowTooltip(false);
    setSliceAtLabel(null);
  };
  // Hide tooltip on scroll to avoid dragging it on the page.
  if (showTooltip) {
    window.addEventListener("scroll", hideTooltip);
  }

  return (
    <div className={className} style={style} onMouseLeave={hideTooltip}>
      {children}
      <Chart
        {...rest}
        chartRef={chartDataRef}
        chartSettings={{
          plugins: {
            sliceDrawPlugin: {
              sliceAtLabel,
              datasetIndex: 0,
            },
          },
          tooltips: {
            enabled: false,
            intersect: false,
            custom: customTooltip(chartDataRef),
          },
          legend: {
            display: false,
          },
          // we could use mergeWith here too, but currently nothing would use it.
          ...chartSettings,
        }}
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

export default ChartWithTooltip;
