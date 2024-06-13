import React, {
  CSSProperties,
  PropsWithChildren,
  useRef,
  useState,
} from 'react';
import { Line } from 'react-chartjs-2';
import type { ChartTooltipModel } from 'chart.js';
import { head, isNumber, maxBy, minBy } from 'lodash';
import Chart, { ChartProps } from '.';
import Tooltip, { TooltipData, TOOLTIP_WIDTH } from './Tooltip';
import {
  findSurveyFromDate,
  getDatasetsTimestamps,
  getTooltipClosestData,
} from './utils';

export interface ChartWithTooltipProps extends ChartProps {
  className?: string;
  style?: CSSProperties;
}

function ChartWithTooltip({
  chartSettings,
  children,
  className,
  style,
  ...rest
}: PropsWithChildren<ChartWithTooltipProps>) {
  const { siteId, surveys, timeZone, startDate, endDate, datasets } = rest;
  const chartDataRef = useRef<Line>(null);

  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [tooltipData, setTooltipData] = useState<TooltipData>({
    siteId,
    date: '',
    datasets: [],
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
      if (typeof date !== 'string') return;

      const dateObject = new Date(date);

      const surveyId = findSurveyFromDate(date, surveys);

      const datasetsDates = getDatasetsTimestamps(datasets);
      const minDataDate = minBy(datasetsDates, (item) => new Date(item));
      const maxDataDate = maxBy(datasetsDates, (item) => new Date(item));

      const closestDatasetData = getTooltipClosestData(dateObject, datasets);

      const nValues = closestDatasetData
        .map(({ data }) => head(data)?.value)
        .filter(isNumber).length;

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
        ((surveyId ? 30 : 0) + nValues * 20 + 60);

      // We display the tooltip only if there are data to display at this point and it lands
      // between the chart's X axis limits.
      const start = startDate || minDataDate || '';
      const end = endDate || maxDataDate || '';
      const isBetween = date >= start && date <= end;
      if (nValues > 0 && isBetween) {
        setTooltipPosition({ top, left });
        setTooltipData({
          ...tooltipData,
          date,
          surveyId,
          datasets: closestDatasetData,
        });
        setShowTooltip(true);
      }
    };

  const hideTooltip = () => {
    setShowTooltip(false);
  };

  // Hide tooltip on scroll to avoid dragging it on the page.
  if (showTooltip) {
    window.addEventListener('scroll', hideTooltip);
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
            mode: 'x',
            intersect: false,
            custom: customTooltip(chartDataRef),
          },
          hover: {
            mode: 'x',
            intersect: false,
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
            position: 'fixed',
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
