import { filter, flatten, isNil, isNumber, map, maxBy, minBy } from 'lodash';
// import type { ChartDataSets, Chart.ChartPoint } from 'chart.js';
import {
  DEFAULT_SURVEY_CHART_POINT_COLOR,
  SELECTED_SURVEY_CHART_POINT_COLOR,
  SURVEY_CHART_POINT_BORDER_COLOR,
  Y_SPACING_PERCENTAGE,
} from 'constants/charts';
import type {
  DailyData,
  HistoricalMonthlyMeanData,
  ValueWithTimestamp,
} from 'store/Sites/types';
import { SurveyListItem } from 'store/Survey/types';
import { sortByDate } from 'helpers/dates';
import { DateTime } from 'luxon-extensions';
import type { ChartProps, Dataset } from '.';

interface Context {
  chart?: Chart;
  dataIndex?: number;
  dataset?: Chart.ChartDataSets;
  datasetIndex?: number;
}

export const getSurveyDates = (surveys: SurveyListItem[]): number[] =>
  surveys
    .filter(({ diveDate }) => !isNil(diveDate))
    .map(({ diveDate }) => new Date(diveDate as string).setHours(0, 0, 0, 0));

export const sameDay = (
  date1: string | number | Date,
  date2: string | number | Date,
) => new Date(date1).toDateString() === new Date(date2).toDateString();

const timeDiff = (incomingDate: string, date: Date) =>
  Math.abs(new Date(incomingDate).getTime() - date.getTime());

export const findSurveyFromDate = (
  inputDate: string,
  surveys: SurveyListItem[],
): number | null | undefined => {
  return (
    surveys.find(
      (survey) => survey.diveDate && sameDay(survey.diveDate, inputDate),
    )?.id || null
  );
};

export function getHistoricalMonthlyMeanDataClosestToDate(
  historicalMonthlyMeanData: HistoricalMonthlyMeanData[],
  date: Date,
) {
  return historicalMonthlyMeanData.length > 0
    ? historicalMonthlyMeanData.reduce((prevClosest, nextPoint) =>
        timeDiff(prevClosest.date, date) > timeDiff(nextPoint.date, date)
          ? nextPoint
          : prevClosest,
      )
    : undefined;
}

export const filterHistoricalMonthlyMeanData = (
  historicalMonthlyMean: HistoricalMonthlyMeanData[],
  from?: string,
  to?: string,
) => {
  if (!from || !to) {
    return historicalMonthlyMean;
  }

  const start = DateTime.fromISO(from);
  const end = DateTime.fromISO(to);

  const closestToStart = getHistoricalMonthlyMeanDataClosestToDate(
    historicalMonthlyMean,
    start.toJSDate(),
  )?.value;
  const closestToEnd = getHistoricalMonthlyMeanDataClosestToDate(
    historicalMonthlyMean,
    end.toJSDate(),
  )?.value;

  const closestToStartArray: HistoricalMonthlyMeanData[] = closestToStart
    ? [{ date: start.toISOString(), value: closestToStart }]
    : [];
  const closestToEndArray: HistoricalMonthlyMeanData[] = closestToEnd
    ? [{ date: end.toISOString(), value: closestToEnd }]
    : [];

  const filteredData = historicalMonthlyMean.filter(
    (item) =>
      DateTime.fromISO(item.date).valueOf() >= start.valueOf() &&
      DateTime.fromISO(item.date).valueOf() <= end.valueOf(),
  );

  return [...closestToStartArray, ...filteredData, ...closestToEndArray];
};

export function getSofarDataClosestToDate(
  spotterData: ValueWithTimestamp[],
  date: Date,
  maxHours?: number,
) {
  if (spotterData.length === 0) {
    return undefined;
  }

  const closest = spotterData.reduce((prevClosest, nextPoint) =>
    timeDiff(prevClosest.timestamp, date) > timeDiff(nextPoint.timestamp, date)
      ? nextPoint
      : prevClosest,
  );

  return timeDiff(closest.timestamp, date) < (maxHours || 12) * 60 * 60 * 1000
    ? closest
    : undefined;
}

export const convertDailyToSofar = (
  dailyData?: DailyData[],
  metrics?: Exclude<keyof DailyData, 'id' | 'date'>[],
):
  | Partial<
      Record<Exclude<keyof DailyData, 'id' | 'date'>, ValueWithTimestamp[]>
    >
  | undefined => {
  const sortedData = sortByDate(dailyData || [], 'date');

  return metrics?.reduce(
    (acc, metric) => ({
      ...acc,
      [metric]: sortedData.map((item) => ({
        value: item[metric],
        timestamp: item.date,
      })),
    }),
    {},
  );
};

export const convertHistoricalMonthlyMeanToSofar = (
  data?: HistoricalMonthlyMeanData[],
): ValueWithTimestamp[] | undefined =>
  data?.map((item) => ({ timestamp: item.date, value: item.value }));

// Util function used to fill the area between the chart's plot and the y axis 0.
// Accepts a threshold and two colors. If a threshold is passed, we use the `above` color
// for the areas between the chart's plot and the threshold

/**
 * Util function used to fill the area between the chart's plot and the y axis 0.
   Accepts a threshold and two colors. If a threshold is passed, we use the `above` color
   for the area between the chart's plot and the threshold and the `below` color for the area
   between the theshold and the y axis 0.
 * @param threshold The specified threshold
 * @param above The fill color for the area between the chart's plot and the threshold
 * @param below The fill color for the area between the theshold and the y axis 0
 * @returns A Chart.js compatible function for the dataset `backgroundColor` property.
 */
export const chartFillColor =
  (threshold: number | null, above: string, below: string) =>
  ({ chart }: Context) => {
    const yScale = (chart as any).scales.y;
    const top = yScale.getPixelForValue(40);
    const zero = yScale.getPixelForValue(threshold);
    const bottom = yScale.getPixelForValue(0);
    const { ctx } = chart as any;
    if (yScale && ctx && top && bottom) {
      const gradient = ctx.createLinearGradient(
        0,
        top,
        0,
        bottom,
      ) as CanvasGradient;
      const ratio = Math.min((zero - top) / (bottom - top), 1);
      if (threshold) {
        gradient.addColorStop(0, above);
        gradient.addColorStop(ratio, above);
        gradient.addColorStop(ratio, below);
        gradient.addColorStop(1, below);
      } else {
        gradient.addColorStop(0, below);
      }

      return gradient;
    }

    return 'transparent';
  };

/**
 * Util function used to fill the surveys data scatter plot points.
   If a survey date is passed, then the scatter plot point for the survey on that date
  is filled with a different color.
 * @param surveyDate The date of the selected survey
 * @returns A Chart.js compatible function for the dataset `pointBackgroundColor` property.
 */
const pointColor = (surveyDate?: Date) => (context: Context) => {
  if (
    surveyDate &&
    context.dataset?.data &&
    typeof context.dataIndex === 'number'
  ) {
    const chartPoint = context.dataset.data[context.dataIndex] as Chart.ChartPoint;
    const chartDate = new Date(chartPoint.x as string);
    return sameDay(surveyDate, chartDate)
      ? SELECTED_SURVEY_CHART_POINT_COLOR
      : DEFAULT_SURVEY_CHART_POINT_COLOR;
  }
  return DEFAULT_SURVEY_CHART_POINT_COLOR;
};

/**
 * A util function used to create gaps in a chart's plot. Chart.js identifies gaps
 * as points with a valid x value and an invalid y value. This function inserts invalid
 * values between chart points that differ more than a specified hours threshold
 * @param data The input chart data
 * @param maxHoursGap The maximum number of hours threshold
 * @returns The augmented data array with the invalid values
 */
const createGaps = (data: Chart.ChartPoint[], maxHoursGap: number): Chart.ChartPoint[] => {
  const nPoints = data.length;
  if (nPoints > 0) {
    return data.reduce<Chart.ChartPoint[]>((acc, curr, currIndex) => {
      // If current and next point differ more than maxHoursGap then
      // insert a point in their middle with no value so that chartJS
      // will notice the gap.
      if (
        currIndex !== 0 &&
        currIndex !== nPoints - 1 &&
        Math.abs(
          DateTime.fromISO(data[currIndex + 1].x as string).diff(
            DateTime.fromISO(curr.x as string),
            'hours',
          ).hours,
        ) > maxHoursGap
      ) {
        return [
          ...acc,
          curr,
          {
            y: undefined,
            x: new Date(
              (DateTime.fromISO(data[currIndex + 1].x as string).valueOf() +
                DateTime.fromISO(curr.x as string).valueOf()) /
                2,
            ).toISOString(),
          },
        ];
      }
      return [...acc, curr];
    }, []);
  }
  return data;
};

/**
 * A util function used to produce the datasets that will be passed on the chart component
 * @param datasets The input datasets
 * @param surveys An array of surveys
 * @param selectedSurveyDate An optional survey date
 * @returns An array of datasets that will be passed on the chart
 */
export const createDatasets = (
  datasets: ChartProps['datasets'],
  surveys: ChartProps['surveys'],
  selectedSurveyDate?: Date,
): Chart.ChartDataSets[] => {
  const surveyDates = getSurveyDates(surveys || []);
  const processedDatasets = datasets
    ?.filter(({ displayData }) => displayData)
    ?.map(
      ({
        label,
        data,
        type,
        fillColor,
        curveColor,
        threshold,
        fillColorAboveThreshold,
        fillColorBelowThreshold,
        maxHoursGap,
      }) => {
        const processedData = data
          .filter(({ value }) => !isNil(value))
          .map(({ value, timestamp }) => ({
            x: timestamp,
            y: value,
          }));
        const chartData =
          typeof maxHoursGap === 'number'
            ? createGaps(processedData, maxHoursGap)
            : processedData;

        return {
          type,
          label,
          fill:
            !!fillColor ||
            !!fillColorAboveThreshold ||
            !!fillColorBelowThreshold,
          borderColor: curveColor,
          borderWidth: 2,
          pointRadius: 0,
          cubicInterpolationMode:
            'monotone' as Chart.ChartDataSets['cubicInterpolationMode'],
          backgroundColor:
            isNumber(threshold) &&
            fillColorAboveThreshold &&
            fillColorBelowThreshold
              ? chartFillColor(
                  threshold,
                  fillColorAboveThreshold,
                  fillColorBelowThreshold,
                )
              : fillColor,
          data: chartData,
        };
      },
    );

  const datasetToAttachSurveysOn = datasets?.find(
    (dataset) => dataset.surveysAttached,
  );

  const surveysDataset = datasetToAttachSurveysOn
    ? {
        type: 'scatter',
        label: 'SURVEYS',
        pointBackgroundColor: pointColor(selectedSurveyDate),
        borderWidth: 1.5,
        pointRadius: 5,
        borderColor: SURVEY_CHART_POINT_BORDER_COLOR,
        data: datasetToAttachSurveysOn.data
          .filter(
            (item) =>
              !isNil(item.value) &&
              surveyDates.some(
                (surveyDate) =>
                  isNumber(surveyDate) && sameDay(surveyDate, item.timestamp),
              ),
          )
          .map(
            ({ timestamp, value }) =>
              ({ x: timestamp, y: value } as Chart.ChartPoint),
          ),
      }
    : undefined;

  return [
    ...(surveysDataset ? [surveysDataset] : []),
    ...(processedDatasets || []),
  ];
};

export const getDatasetsTimestamps = (datasets: ChartProps['datasets']) =>
  flatten(map(datasets, ({ data }) => map(data, ({ timestamp }) => timestamp)));

/**
 * A util function that fetches the closest data for a specified date.
 * @param date The input date
 * @param datasets An array of datasets.
 * @returns For each dataset, another dataset, whose data is a sigle item array, containing the
 * value closest to specified date.
 */
export const getTooltipClosestData = (date: Date, datasets?: Dataset[]) =>
  (datasets?.map((dataset) => {
    const closestData =
      getSofarDataClosestToDate(
        dataset.data,
        date,
        dataset.tooltipMaxHoursGap,
      ) || undefined;
    return {
      ...dataset,
      data: closestData ? [closestData] : [],
    };
  }) || []) as Dataset[];

/**
 * Util function used to calculate the chart's horizontal and vertical limits
 * @param datasets The input datasets
 * @param startDate Optional date to use as the chart's left limit
 * @param endDate Optional date to use as the chart's right limit
 * @param temperatureThreshold A possible temperature threshold taken into account for the chart's vertical limits
 * @returns The chart's horizontal and vertical limits
 */
export const calculateAxisLimits = (
  datasets: ChartProps['datasets'],
  startDate: ChartProps['startDate'],
  endDate: ChartProps['endDate'],
  temperatureThreshold: ChartProps['temperatureThreshold'],
) => {
  const timestampsToConsiderForXAxis = getDatasetsTimestamps(
    datasets?.filter((dataset) => dataset.considerForXAxisLimits),
  );
  const accumulatedYAxisData = flatten(
    map(datasets, ({ data }) =>
      map(
        filter(data, ({ value }) => !isNil(value)),
        ({ value }) => value,
      ),
    ),
  );

  // x axis limits calculation
  const datasetsXMin = minBy(
    timestampsToConsiderForXAxis,
    (timestamp) => new Date(timestamp),
  );
  const datasetsXMax = maxBy(
    timestampsToConsiderForXAxis,
    (timestamp) => new Date(timestamp),
  );
  const xAxisMin = Number((startDate || datasetsXMin) ?? 0);
  const xAxisMax = Number((endDate || datasetsXMax) ?? 0);

  // y axis limits calculation
  const datasetsYMin = Math.min(...accumulatedYAxisData);
  const datasetsYMax = Math.max(...accumulatedYAxisData);
  const ySpacing = Math.ceil(
    Y_SPACING_PERCENTAGE * (datasetsYMax - datasetsYMin),
  ); // Set ySpacing as a percentage of the data range
  const yAxisMinTemp = datasetsYMin - ySpacing;
  const yAxisMaxTemp = datasetsYMax + ySpacing;
  const yAxisMin = Math.round(
    temperatureThreshold
      ? Math.min(yAxisMinTemp, temperatureThreshold - ySpacing)
      : yAxisMinTemp,
  );
  const yAxisMax = Math.round(
    temperatureThreshold
      ? Math.max(yAxisMaxTemp, temperatureThreshold + ySpacing)
      : yAxisMaxTemp,
  );

  return { xAxisMin, xAxisMax, yAxisMin, yAxisMax };
};

/**
 * A custom hook used to produce the datasets passed on the chart and calculate
 * the chart's horizontal and vertical axis limits.
 * @param datasets The input datasets
 * @param startDate Optional date to use as the chart's left limit
 * @param endDate Optional date to use as the chart's right limit
 * @param surveys An array of surveys to attach in one of the datasets plots
 * @param temperatureThreshold A possible temperature threshold taken into account for the chart's vertical limits
 * @param selectedSurveyDate The date of the selected survey
 * @returns An array of datasets passed on the chart and chart's axis limits
 */
export const useProcessedChartData = (
  datasets: ChartProps['datasets'],
  startDate: ChartProps['startDate'],
  endDate: ChartProps['endDate'],
  surveys: ChartProps['surveys'],
  temperatureThreshold: ChartProps['temperatureThreshold'],
  selectedSurveyDate?: Date,
) => {
  const processedDatasets = createDatasets(
    datasets,
    surveys,
    selectedSurveyDate,
  );
  const axisLimits = calculateAxisLimits(
    datasets,
    startDate,
    endDate,
    temperatureThreshold,
  );

  return { processedDatasets, ...axisLimits };
};
