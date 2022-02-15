import moment from "moment";
import {
  filter,
  flatten,
  inRange,
  isNil,
  isNumber,
  map,
  maxBy,
  minBy,
} from "lodash";
import { ChartDataSets, ChartPoint } from "chart.js";
import type {
  DailyData,
  HistoricalMonthlyMeanData,
  SofarValue,
} from "../../store/Sites/types";
import { SurveyListItem } from "../../store/Survey/types";
import {
  DEFAULT_SURVEY_CHART_POINT_COLOR,
  SELECTED_SURVEY_CHART_POINT_COLOR,
  SURVEY_CHART_POINT_BORDER_COLOR,
  Y_SPACING_PERCENTAGE,
} from "../../constants/charts";
import type { ChartProps } from ".";

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
  date2: string | number | Date
) => new Date(date1).toDateString() === new Date(date2).toDateString();

const timeDiff = (incomingDate: string, date: Date) =>
  Math.abs(new Date(incomingDate).getTime() - date.getTime());

export const findSurveyFromDate = (
  inputDate: string,
  surveys: SurveyListItem[]
): number | null | undefined => {
  return (
    surveys.find(
      (survey) => survey.diveDate && sameDay(survey.diveDate, inputDate)
    )?.id || null
  );
};

export function getHistoricalMonthlyMeanDataClosestToDate(
  historicalMonthlyMeanData: HistoricalMonthlyMeanData[],
  date: Date
) {
  return historicalMonthlyMeanData.length > 0
    ? historicalMonthlyMeanData.reduce((prevClosest, nextPoint) =>
        timeDiff(prevClosest.date, date) > timeDiff(nextPoint.date, date)
          ? nextPoint
          : prevClosest
      )
    : undefined;
}

export const filterHistoricalMonthlyMeanData = (
  historicalMonthlyMean: HistoricalMonthlyMeanData[],
  from?: string,
  to?: string
) => {
  if (!from || !to) {
    return historicalMonthlyMean;
  }

  const start = moment(from);
  const end = moment(to);

  const closestToStart = getHistoricalMonthlyMeanDataClosestToDate(
    historicalMonthlyMean,
    new Date(start.toISOString())
  )?.value;
  const closestToEnd = getHistoricalMonthlyMeanDataClosestToDate(
    historicalMonthlyMean,
    new Date(end.toISOString())
  )?.value;

  const closestToStartArray: HistoricalMonthlyMeanData[] = closestToStart
    ? [{ date: start.toISOString(), value: closestToStart }]
    : [];
  const closestToEndArray: HistoricalMonthlyMeanData[] = closestToEnd
    ? [{ date: end.toISOString(), value: closestToEnd }]
    : [];

  const filteredData = historicalMonthlyMean.filter((item) =>
    inRange(moment(item.date).valueOf(), start.valueOf(), end.valueOf() + 1)
  );

  return [...closestToStartArray, ...filteredData, ...closestToEndArray];
};

export function getSofarDataClosestToDate(
  spotterData: SofarValue[],
  date: Date,
  maxHours?: number
) {
  if (spotterData.length === 0) {
    return undefined;
  }

  const closest = spotterData.reduce((prevClosest, nextPoint) =>
    timeDiff(prevClosest.timestamp, date) > timeDiff(nextPoint.timestamp, date)
      ? nextPoint
      : prevClosest
  );

  return timeDiff(closest.timestamp, date) < (maxHours || 12) * 60 * 60 * 1000
    ? closest
    : undefined;
}

export const convertDailyToSofar = (
  dailyData?: DailyData[],
  metrics?: Exclude<keyof DailyData, "id" | "date">[]
):
  | Partial<Record<Exclude<keyof DailyData, "id" | "date">, SofarValue[]>>
  | undefined =>
  metrics?.reduce(
    (acc, metric) => ({
      ...acc,
      [metric]: dailyData?.map((item) => ({
        value: item[metric],
        timestamp: item.date,
      })),
    }),
    {}
  );

export const convertHistoricalMonthlyMeanToSofar = (
  data?: HistoricalMonthlyMeanData[]
): SofarValue[] | undefined =>
  data?.map((item) => ({ timestamp: item.date, value: item.value }));

export const chartFillColor =
  (threshold: number | null, above: string, below: string) =>
  ({ chart }: Context) => {
    const yScale = (chart as any).scales["y-axis-0"];
    const top = yScale.getPixelForValue(40);
    const zero = yScale.getPixelForValue(threshold);
    const bottom = yScale.getPixelForValue(0);
    const { ctx } = chart as any;
    if (yScale && ctx && top && bottom) {
      const gradient = ctx.createLinearGradient(
        0,
        top,
        0,
        bottom
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

    return "transparent";
  };

export const pointColor = (surveyDate?: Date) => (context: Context) => {
  if (
    surveyDate &&
    context.dataset?.data &&
    typeof context.dataIndex === "number"
  ) {
    const chartPoint = context.dataset.data[context.dataIndex] as ChartPoint;
    const chartDate = new Date(chartPoint.x as string);
    return sameDay(surveyDate, chartDate)
      ? SELECTED_SURVEY_CHART_POINT_COLOR
      : DEFAULT_SURVEY_CHART_POINT_COLOR;
  }
  return DEFAULT_SURVEY_CHART_POINT_COLOR;
};

const createGaps = (data: ChartPoint[], maxHoursGap: number): ChartPoint[] => {
  const nPoints = data.length;
  if (nPoints > 0) {
    return data.reduce<ChartPoint[]>((acc, curr, currIndex) => {
      // If current and next point differ more than maxHoursGap then
      // insert a point in their middle with no value so that chartJS
      // will notice the gap.
      if (
        currIndex !== 0 &&
        currIndex !== nPoints - 1 &&
        moment(data[currIndex + 1].x).diff(moment(curr.x), "hours") >
          maxHoursGap
      ) {
        return [
          ...acc,
          curr,
          {
            y: undefined,
            x: new Date(
              (moment(data[currIndex + 1].x).valueOf() +
                moment(curr.x).valueOf()) /
                2
            ).toISOString(),
          },
        ];
      }
      return [...acc, curr];
    }, []);
  }
  return data;
};

export const createDatasets = (
  datasets: ChartProps["datasets"],
  surveys: ChartProps["surveys"],
  selectedSurveyDate?: Date
): ChartDataSets[] => {
  const surveyDates = getSurveyDates(surveys || []);
  const processedDatasets = datasets?.map(
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
        typeof maxHoursGap === "number"
          ? createGaps(processedData, maxHoursGap)
          : processedData;

      return {
        type,
        label,
        fill:
          !!fillColor || !!fillColorAboveThreshold || !!fillColorBelowThreshold,
        borderColor: curveColor,
        borderWidth: 2,
        pointRadius: 0,
        cubicInterpolationMode:
          "monotone" as ChartDataSets["cubicInterpolationMode"],
        backgroundColor:
          isNumber(threshold) &&
          fillColorAboveThreshold &&
          fillColorBelowThreshold
            ? chartFillColor(
                threshold,
                fillColorAboveThreshold,
                fillColorBelowThreshold
              )
            : fillColor,
        data: chartData,
      };
    }
  );

  const datasetToAttachSurveysOn = datasets?.find(
    (dataset) => dataset.surveysAttached
  );

  const surveysDataset = datasetToAttachSurveysOn
    ? {
        type: "scatter",
        label: "SURVEYS",
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
                  isNumber(surveyDate) && sameDay(surveyDate, item.timestamp)
              )
          )
          .map(
            ({ timestamp, value }) => ({ x: timestamp, y: value } as ChartPoint)
          ),
      }
    : undefined;

  return [
    ...(surveysDataset ? [surveysDataset] : []),
    ...(processedDatasets || []),
  ];
};

export const getDatasetsTimestamps = (datasets: ChartProps["datasets"]) =>
  flatten(map(datasets, ({ data }) => map(data, ({ timestamp }) => timestamp)));

export const calculateAxisLimits = (
  datasets: ChartProps["datasets"],
  startDate: ChartProps["startDate"],
  endDate: ChartProps["endDate"],
  temperatureThreshold: ChartProps["temperatureThreshold"]
) => {
  const timestampsToConsiderForXAxis = getDatasetsTimestamps(
    datasets?.filter((dataset) => dataset.considerForXAxisLimits)
  );
  const accumulatedYAxisData = flatten(
    map(datasets, ({ data }) =>
      map(
        filter(data, ({ value }) => !isNil(value)),
        ({ value }) => value
      )
    )
  );

  // x axis limits calculation
  const datasetsXMin = minBy(
    timestampsToConsiderForXAxis,
    (timestamp) => new Date(timestamp)
  );
  const datasetsXMax = maxBy(
    timestampsToConsiderForXAxis,
    (timestamp) => new Date(timestamp)
  );
  const xAxisMin = startDate || datasetsXMin;
  const xAxisMax = endDate || datasetsXMax;

  // y axis limits calculation
  const datasetsYMin = Math.min(...accumulatedYAxisData);
  const datasetsYMax = Math.max(...accumulatedYAxisData);
  const ySpacing = Math.ceil(
    Y_SPACING_PERCENTAGE * (datasetsYMax - datasetsYMin)
  ); // Set ySpacing as a percentage of the data range
  const yAxisMinTemp = datasetsYMin - ySpacing;
  const yAxisMaxTemp = datasetsYMax + ySpacing;
  const yAxisMin = Math.round(
    temperatureThreshold
      ? Math.min(yAxisMinTemp, temperatureThreshold - ySpacing)
      : yAxisMinTemp
  );
  const yAxisMax = Math.round(
    temperatureThreshold
      ? Math.max(yAxisMaxTemp, temperatureThreshold + ySpacing)
      : yAxisMaxTemp
  );

  return { xAxisMin, xAxisMax, yAxisMin, yAxisMax };
};

export const useProcessedChartData = (
  datasets: ChartProps["datasets"],
  startDate: ChartProps["startDate"],
  endDate: ChartProps["endDate"],
  surveys: ChartProps["surveys"],
  temperatureThreshold: ChartProps["temperatureThreshold"],
  selectedSurveyDate?: Date
) => {
  const processedDatasets = createDatasets(
    datasets,
    surveys,
    selectedSurveyDate
  );
  const axisLimits = calculateAxisLimits(
    datasets,
    startDate,
    endDate,
    temperatureThreshold
  );

  return { processedDatasets, ...axisLimits };
};
