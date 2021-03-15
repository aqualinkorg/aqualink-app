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
  filterDailyData,
  getMontlyMaxDataClosestToDate,
} from "./utils";

export interface ChartWithTooltipProps extends ChartProps {
  depth: number | null;
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
  const {
    dailyData,
    spotterData,
    hoboBottomTemperature,
    monthlyMax,
    reefId,
    surveys,
    timeZone,
    startDate,
    endDate,
  } = rest;

  function getValuesCloseToDate(date: string) {
    const filteredDailyData = filterDailyData(dailyData, startDate, endDate);

    const dailyDataForDate =
      // Try to find data on same day, else closest, else nothing.
      filteredDailyData.filter((data) => sameDay(data.date, date))[0] ||
      getDailyDataClosestToDate(filteredDailyData, new Date(date), 24) ||
      {};
    const { satelliteTemperature, avgBottomTemperature } = dailyDataForDate;

    const montlyMaxTemp =
      (monthlyMax && getMontlyMaxDataClosestToDate(monthlyMax, new Date(date)))
        ?.value || null;

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

    const hoboBottomTemp =
      (hoboBottomTemperature &&
        getSpotterDataClosestToDate(hoboBottomTemperature, new Date(date), 6)
          ?.value) ||
      null;

    const bottomTemperature = bottomTemp || avgBottomTemperature;

    return {
      satelliteTemperature,
      montlyMaxTemp,
      spotterSurfaceTemp,
      hoboBottomTemp,
      bottomTemperature,
    };
  }

  const availableDates = [
    ...dailyData.map((daily) => daily.date),
    ...(spotterData?.surfaceTemperature
      ? spotterData.surfaceTemperature.map((data) => data.timestamp)
      : []),
    ...(hoboBottomTemperature
      ? hoboBottomTemperature.map((daily) => daily.timestamp)
      : []),
  ];

  const dataByDate = availableDates.reduce(
    (acc, date) => ({
      ...acc,
      [date]: acc[date] || getValuesCloseToDate(date),
    }),
    {} as Record<string, any>
  );

  const chartDataRef = useRef<Line>(null);

  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [tooltipData, setTooltipData] = useState<TooltipData>({
    reefId,
    date: "",
    depth,
    bottomTemperature: 0,
    spotterSurfaceTemp: null,
    surfaceTemperature: 0,
    hoboBottomTemp: null,
    monthlyMax: null,
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

    const surveyId = findSurveyFromDate(date, surveys);

    const {
      satelliteTemperature,
      bottomTemperature,
      spotterSurfaceTemp,
      hoboBottomTemp,
      montlyMaxTemp,
    } = dataByDate[date];

    const nValues = [
      satelliteTemperature,
      bottomTemperature,
      spotterSurfaceTemp,
      hoboBottomTemp,
      montlyMaxTemp,
    ].filter(Boolean).length;

    const position = chart.chartInstance.canvas.getBoundingClientRect();
    const left = position.left + tooltipModel.caretX - 95;
    const top =
      position.top +
      tooltipModel.caretY -
      ((surveyId ? 30 : 0) + nValues * 20 + 48);

    if (
      [
        satelliteTemperature,
        bottomTemperature,
        spotterSurfaceTemp,
        hoboBottomTemp,
        montlyMaxTemp,
      ].some(Boolean)
    ) {
      setTooltipPosition({ top, left });
      setTooltipData({
        ...tooltipData,
        date,
        depth,
        bottomTemperature,
        spotterSurfaceTemp,
        surfaceTemperature: satelliteTemperature,
        hoboBottomTemp,
        monthlyMax: montlyMaxTemp,
        surveyId,
      });
      setShowTooltip(true);
    }
  };

  const hideTooltip = () => {
    setShowTooltip(false);
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
          <Tooltip
            {...tooltipData}
            reefTimeZone={timeZone}
            userTimeZone={Intl.DateTimeFormat().resolvedOptions().timeZone}
          />
        </div>
      ) : null}
    </div>
  );
}

export default ChartWithTooltip;
