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
  CHART_BOTTOM_TEMP_ENABLED,
  getSpotterDataClosestToDate,
  sameDay,
} from "./utils";

export interface ChartWithTooltipProps extends ChartProps {
  depth: number | null;
  className?: string;
  style?: CSSProperties;
}

function ChartWithTooltip({
  depth,
  dailyData,
  spotterData,
  surveys,
  temperatureThreshold,
  chartSettings,
  children,
  className,
  style,
  ...rest
}: PropsWithChildren<ChartWithTooltipProps>) {
  const chartDataRef = useRef<Line>(null);

  const [sliceAtLabel, setSliceAtLabel] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [tooltipData, setTooltipData] = useState<TooltipData>({
    date: "",
    depth,
    bottomTemperature: 0,
    spotterSurfaceTemp: null,
    surfaceTemperature: 0,
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
    if (typeof date !== "string") {
      return;
    }

    const dailyDataForDate =
      dailyData.filter((data) => sameDay(data.date, date))[0] || {};
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

    const bottomTemperature =
      bottomTemp || (CHART_BOTTOM_TEMP_ENABLED ? avgBottomTemperature : null);

    const nValues = [
      satelliteTemperature,
      bottomTemperature,
      spotterSurfaceTemp,
    ].filter(Boolean).length;

    const position = chart.chartInstance.canvas.getBoundingClientRect();
    const left = position.left + tooltipModel.caretX - 80;
    const top = position.top + tooltipModel.caretY - ((nValues + 1) * 30 + 10);

    if (
      [satelliteTemperature, bottomTemperature, spotterSurfaceTemp].some(
        Boolean
      )
    ) {
      setTooltipPosition({ top, left });
      setTooltipData({
        date,
        depth,
        bottomTemperature,
        spotterSurfaceTemp,
        surfaceTemperature: satelliteTemperature,
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
        spotterData={spotterData}
        dailyData={dailyData}
        surveys={surveys}
        chartRef={chartDataRef}
        temperatureThreshold={temperatureThreshold}
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
