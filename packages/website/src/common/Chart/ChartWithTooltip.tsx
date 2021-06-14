import React, {
  CSSProperties,
  PropsWithChildren,
  useRef,
  useState,
} from "react";
import { Line } from "react-chartjs-2";
import type { ChartTooltipModel } from "chart.js";
import { last, isNumber } from "lodash";
import moment from "moment";
import Chart, { ChartProps } from ".";
import Tooltip, { TooltipData } from "./Tooltip";
import {
  getDailyDataClosestToDate,
  getSofarDataClosestToDate,
  findSurveyFromDate,
  sameDay,
  filterDailyData,
  getHistoricalMonthlyMeanDataClosestToDate,
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
    hoboBottomTemperatureData,
    oceanSenseData,
    oceanSenseDataUnit,
    historicalMonthlyMeanData,
    reefId,
    surveys,
    timeZone,
    startDate,
    endDate,
  } = rest;
  const chartDataRef = useRef<Line>(null);

  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [tooltipData, setTooltipData] = useState<TooltipData>({
    reefId,
    date: "",
    depth,
    historicalMonthlyMeanTemp: null,
    satelliteTemp: null,
    spotterTopTemp: null,
    spotterBottomTemp: null,
    hoboBottomTemp: null,
    oceanSense: null,
    oceanSenseUnit: null,
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

    const dateObject = new Date(date);

    const surveyId = findSurveyFromDate(date, surveys);

    const filteredDailyData = filterDailyData(dailyData, startDate, endDate);

    const dailyDataForDate =
      // Try to find data on same day, else closest, else nothing.
      filteredDailyData.filter((data) => sameDay(data.date, date))[0] ||
      getDailyDataClosestToDate(filteredDailyData, dateObject, 24) ||
      {};
    const { satelliteTemperature } = dailyDataForDate;

    const closestHistorical =
      historicalMonthlyMeanData &&
      getHistoricalMonthlyMeanDataClosestToDate(
        historicalMonthlyMeanData,
        dateObject
      )?.value;
    const closestSpotterTop =
      spotterData &&
      getSofarDataClosestToDate(spotterData.topTemperature, dateObject, 6)
        ?.value;
    const closestSpotterBottom =
      spotterData &&
      getSofarDataClosestToDate(spotterData.bottomTemperature, dateObject, 6)
        ?.value;
    const closestHoboBottom =
      hoboBottomTemperatureData &&
      getSofarDataClosestToDate(hoboBottomTemperatureData, dateObject, 6)
        ?.value;
    const closestOceanSense =
      oceanSenseData &&
      getSofarDataClosestToDate(oceanSenseData, dateObject, 6)?.value;

    const historicalMonthlyMeanTemp = isNumber(closestHistorical)
      ? closestHistorical
      : null;

    const satelliteTemp = satelliteTemperature || null;

    const spotterTopTemp = isNumber(closestSpotterTop)
      ? closestSpotterTop
      : null;

    const spotterBottomTemp = isNumber(closestSpotterBottom)
      ? closestSpotterBottom
      : null;

    const hoboBottomTemp = isNumber(closestHoboBottom)
      ? closestHoboBottom
      : null;

    const oceanSense = isNumber(closestOceanSense) ? closestOceanSense : null;

    const nValues = [
      historicalMonthlyMeanTemp,
      satelliteTemp,
      spotterTopTemp,
      spotterBottomTemp,
      hoboBottomTemp,
      oceanSense,
    ].filter(isNumber).length;

    const position = chart.chartInstance.canvas.getBoundingClientRect();
    const left = position.left + tooltipModel.caretX - 95;
    const top =
      position.top +
      tooltipModel.caretY -
      ((surveyId ? 30 : 0) + nValues * 20 + 48);

    if (
      nValues > 0 &&
      moment(date).isBetween(
        moment(startDate || last(filteredDailyData)?.date),
        moment(endDate || filteredDailyData?.[0]?.date),
        undefined,
        "[]"
      )
    ) {
      setTooltipPosition({ top, left });
      setTooltipData({
        ...tooltipData,
        date,
        depth,
        historicalMonthlyMeanTemp,
        satelliteTemp,
        spotterTopTemp,
        spotterBottomTemp,
        hoboBottomTemp,
        oceanSense,
        oceanSenseUnit: oceanSenseDataUnit || null,
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
