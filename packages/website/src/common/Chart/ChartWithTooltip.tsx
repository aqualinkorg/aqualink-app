import React, {
  CSSProperties,
  PropsWithChildren,
  useRef,
  useState,
} from "react";
import { Line } from "react-chartjs-2";
import type { ChartTooltipModel } from "chart.js";
import { isNumber, last } from "lodash";
import moment from "moment";
import Chart, { ChartProps } from ".";
import Tooltip, { TooltipData, TOOLTIP_WIDTH } from "./Tooltip";
import {
  filterDailyData,
  findSurveyFromDate,
  getDailyDataClosestToDate,
  getHistoricalMonthlyMeanDataClosestToDate,
  getSofarDataClosestToDate,
  sameDay,
} from "./utils";

export interface ChartWithTooltipProps extends ChartProps {
  depth: number | null;
  className?: string;
  style?: CSSProperties;
}

/**
 * Gets the number of a result or null if no number was found.
 */
const numberOrNull = (result: { value: number } | undefined): number | null => {
  const value = result?.value;
  return isNumber(value) ? value : null;
};

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
    siteId,
    surveys,
    timeZone,
    startDate,
    endDate,
  } = rest;
  const chartDataRef = useRef<Line>(null);

  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [tooltipData, setTooltipData] = useState<TooltipData>({
    siteId,
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

  const customTooltip =
    (ref: React.RefObject<Line>) => (tooltipModel: ChartTooltipModel) => {
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

      const historicalMonthlyMeanTemp = numberOrNull(
        getHistoricalMonthlyMeanDataClosestToDate(
          historicalMonthlyMeanData || [],
          dateObject
        )
      );

      const spotterTopTemp = numberOrNull(
        getSofarDataClosestToDate(
          spotterData?.topTemperature || [],
          dateObject,
          6
        )
      );

      const spotterBottomTemp = numberOrNull(
        getSofarDataClosestToDate(
          spotterData?.bottomTemperature || [],
          dateObject,
          6
        )
      );

      const hoboBottomTemp = numberOrNull(
        getSofarDataClosestToDate(
          hoboBottomTemperatureData || [],
          dateObject,
          6
        )
      );

      const oceanSense = numberOrNull(
        getSofarDataClosestToDate(oceanSenseData || [], dateObject, 6)
      );

      const satelliteTemp = satelliteTemperature || null;

      const nValues = [
        historicalMonthlyMeanTemp,
        satelliteTemp,
        spotterTopTemp,
        spotterBottomTemp,
        hoboBottomTemp,
        oceanSense,
      ].filter(isNumber).length;

      // Chart.js displays tooltips in a parallel to the X axis preference, meaning
      // that it will appear right or left from the chart point. We want to change that,
      // and display the tooltip in a Y axis preference, and more specifically, above the chart point.
      const position = chart.chartInstance.canvas.getBoundingClientRect();

      // We center the tooltip in the X axis by subtracting half its width.
      const left = position.left + tooltipModel.caretX - TOOLTIP_WIDTH / 2;

      // We increase the tooltip's top, so that it lands above the chart point. The amount by
      // which we increase varies based on how many values we display and if there is a survey at that point,
      // as we display a `VIEW SURVEY` button.
      const top =
        position.top +
        tooltipModel.caretY -
        ((surveyId ? 30 : 0) + nValues * 20 + 48);

      // We display the tooltip only if there are data to display at this point and it lands
      // between the chart's X axis limits.
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
            siteTimeZone={timeZone}
            userTimeZone={Intl.DateTimeFormat().resolvedOptions().timeZone}
          />
        </div>
      ) : null}
    </div>
  );
}

export default ChartWithTooltip;
