import React, {
  MutableRefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
  memo,
} from 'react';
import { useSelector } from 'react-redux';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import { Tick } from 'chart.js';
import 'chartjs-adapter-date-fns';
import { enUS } from 'date-fns/locale';
import { mergeWith, isEqual } from 'lodash';
import type { Metrics, ValueWithTimestamp, Sources } from 'store/Sites/types';
import './plugins/backgroundPlugin';
import './plugins/annotationPlugin';
import { SurveyListItem } from 'store/Survey/types';
import { surveyDetailsSelector } from 'store/Survey/surveySlice';
import { Range } from 'store/Sites/types';
import { convertToLocalTime } from 'helpers/dates';
import { useProcessedChartData } from './utils';

// An interface that describes all the possible options for displaying a dataset on a chart.
export interface Dataset {
  label: string; // The dataset's label
  data: ValueWithTimestamp[]; // The dataset's data, typed as a ValueWithTimestamp array
  type: 'line' | 'scatter'; // The plot's type, either line or scatter
  unit: string; // The unit of the dataset's data, e.g. °C for temperature data
  curveColor: string; // The color used for displaying the data
  threshold?: number; // An optional data threshold
  fillColor?: string; // An optional color to fill the area beneath the chart
  fillColorAboveThreshold?: string; // The color used to fill the area between the chart and the threshold. Only used if a threshold is specified
  fillColorBelowThreshold?: string; // The color used to fill the area between the threshold and the y axis 0. Only used if a threshold is specified
  surveysAttached?: boolean; // Boolean that determines if the surveys scatter dataset will be attached on the chart's plot
  considerForXAxisLimits?: boolean; // Boolean that determines if the plot's min and max date will be used to calculate the chart's x axis limits
  maxHoursGap?: number; // If there is a time gap bigger than this, then display a gap on the chart's plot
  tooltipMaxHoursGap?: number; // The chart's tooltip takes into account data that belong in the interval [x - tooltipMaxHoursGap, x + tooltipMaxHoursGap]
  isDailyUpdated?: boolean; // A boolean that determines if the data is daily updated
  displayData?: boolean; // A boolean that determines if the data will be displayed on the chart
  displayCardColumn?: boolean; // A boolean that determinse if the data will be displayed in the analysis card
  cardColumnName?: string; // The label of the data column on the analysis card. If not specified, the label property is used instead
  cardColumnTooltip?: string; // An optional tooltip for the card column label
  tooltipLabel?: string; // An optional label for the data on the chart's tooltip. If not specified, the label property is used instead
  metric?: Metrics;
  source?: Sources;
}

export interface ChartProps {
  // eslint-disable-next-line react/no-unused-prop-types
  siteId: number;
  datasets?: Dataset[];
  timeZone?: string | null;
  startDate?: string;
  endDate?: string;
  chartPeriod?: 'hour' | Range | null;
  surveys: SurveyListItem[];
  temperatureThreshold: number | null;
  maxMonthlyMean: number | null;
  background?: boolean;
  showYearInTicks?: boolean;
  // eslint-disable-next-line react/no-unused-prop-types
  fill?: boolean;
  hideYAxisUnits?: boolean;

  chartSettings?: {};
  chartRef?: MutableRefObject<any | null>;
}

const SMALL_WINDOW = 400;

const makeAnnotation = (
  name: string,
  value: number,
  borderColor: string,
  backgroundColor = 'rgb(169,169,169, 0.7)',
) => ({
  type: 'line' as const,
  scaleID: 'y',
  value,
  borderColor,
  borderWidth: 2,
  borderDash: [5, 5],
  label: {
    display: true,
    backgroundColor,
    yPadding: 3,
    xPadding: 3,
    position: 'start' as const,
    xAdjust: 10,
    content: name,
  },
});

function Chart({
  datasets,
  surveys,
  timeZone,
  startDate,
  endDate,
  chartPeriod,
  temperatureThreshold,
  maxMonthlyMean,
  background,
  showYearInTicks,
  hideYAxisUnits,
  chartSettings = {},
  chartRef: forwardRef,
}: ChartProps) {
  const chartRef = useRef<any>(null);
  const selectedSurvey = useSelector(surveyDetailsSelector);
  const selectedSurveyDate = selectedSurvey?.diveDate
    ? new Date(convertToLocalTime(selectedSurvey.diveDate, timeZone))
    : undefined;

  if (forwardRef) {
    // this might be doable with forwardRef or callbacks, but its a little hard since we need to
    // use it in two places
    // eslint-disable-next-line no-param-reassign
    forwardRef.current = chartRef.current;
  }

  const [xTickShift, setXTickShift] = useState<number>(0);

  const [xPeriod, setXPeriod] = useState<'week' | 'month'>('week');

  // eslint-disable-next-line
  const [hideLastTick, setHideLastTick] = useState<boolean>(false);

  const { processedDatasets, xAxisMax, xAxisMin, yAxisMax, yAxisMin } =
    useProcessedChartData(
      datasets,
      startDate,
      endDate,
      surveys,
      temperatureThreshold,
      selectedSurveyDate,
    );

  const nYTicks = 5;
  const yStepSize = Math.ceil((yAxisMax - yAxisMin) / nYTicks);

  const changeXTickShiftAndPeriod = () => {
    const { current } = chartRef;
    if (current && current.chartInstance) {
      // not sure why 'scales' doesn't have a type. Possibly from a plugin?
      const xScale = (current.chartInstance as any).scales['x-axis-0'];
      const ticksPositions = xScale.ticks.map((_: any, index: number) =>
        xScale.getPixelForTick(index),
      );
      const nTicks = ticksPositions.length;
      const {
        chartArea: { right, left },
      } = current.chartInstance;
      const ticksWidth =
        typeof nTicks === 'number' && nTicks > 0 ? (right - left) / nTicks : 0;
      // If last tick is too close to the chart's right edge then hide it
      if (right - ticksPositions[nTicks - 1] < ticksWidth) {
        setHideLastTick(true);
      } else {
        setHideLastTick(false);
      }
      setXTickShift((ticksPositions[2] - ticksPositions[1]) / 2);
      if (xScale.width > SMALL_WINDOW) {
        setXPeriod('week');
      } else {
        setXPeriod('month');
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
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
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
          color: background ? 'rgb(158, 166, 170, 0.07)' : '#ffffff',
        },
        annotation: {
          annotations: [
            ...(maxMonthlyMean
              ? [
                  makeAnnotation(
                    'Historical Max',
                    maxMonthlyMean,
                    'rgb(75, 192, 192)',
                  ),
                ]
              : []),
            ...(temperatureThreshold
              ? [
                  makeAnnotation(
                    'Bleaching Threshold',
                    temperatureThreshold,
                    '#ff8d00',
                  ),
                ]
              : []),
          ],
        },
        tooltip: {
          enabled: false,
        },
        legend: {
          display: false,
        },
      },
      scales: {
        x: {
          type: 'time' as const,
          time: {
            displayFormats: {
              week: `MMM d ${showYearInTicks ? 'yy' : ''}`,
              month: `MMM ${showYearInTicks ? 'yy' : ''}`,
            },
            unit: chartPeriod || xPeriod,
          },
          adapters: {
            date: {
              locale: enUS,
            },
          },
          min: xAxisMin,
          max: xAxisMax,
          ticks: {
            labelOffset: xTickShift,
            padding: 10,
          },
          grid: {
            display: false,
          },
        },
        y: {
          min: yAxisMin,
          max: yAxisMax,
          grid: {
            drawTicks: false,
          },
          ticks: {
            stepSize: yStepSize,
            callback: (v: number | string, index: number, ticks: Tick[]) => {
              const values = ticks.map((tick) => tick.value);
              const value = Number(v);
              // Only show ticks when at least one of the following conditions holds:
              //   1: step size is equal to one
              //   2: it's not a marginal value (i.e. its index is between 1 and L - 2)
              //   3: it's the first value (index is 0) and its difference from the next one exceeds 80% of the step size
              //   4: it's the last value (index is L - 1) and its difference from the previous one exceeds 80% of the step size
              if (
                yStepSize === 1 ||
                (index > 0 && index < values.length - 1) ||
                (index === 0 && value - values[index + 1] > 0.8 * yStepSize) ||
                (index === values.length - 1 &&
                  values[index - 1] - value > 0.8 * yStepSize)
              ) {
                return `${value}${!hideYAxisUnits ? '°' : ''}  `;
              }
              return '';
            },
          },
        },
      },
    },
    chartSettings,
    // makes sure arrays are merged correctly
    (el: any, toMerge: any) => {
      if (Array.isArray(el)) {
        return el.concat(toMerge);
      }
      return undefined;
    },
  );

  return (
    <Line
      ref={chartRef}
      options={settings}
      data={{ datasets: processedDatasets as any }}
    />
  );
}

export default memo(Chart, (prevProps, nextProps) => {
  return (
    prevProps.startDate === nextProps.startDate &&
    prevProps.endDate === nextProps.endDate &&
    isEqual(prevProps.datasets, nextProps.datasets) &&
    prevProps.chartPeriod === nextProps.chartPeriod
  );
});
