import type { ChartPoint } from "chart.js";
import { ChartComponentProps } from "react-chartjs-2";
import moment from "moment";
import { inRange } from "lodash";
import type { ChartProps } from ".";
import { isBefore } from "../../helpers/dates";
import { sortByDate } from "../../helpers/sortDailyData";
import type {
  DailyData,
  HistoricalMonthlyMeanData,
  SofarValue,
  TimeSeries,
} from "../../store/Sites/types";
import { SurveyListItem } from "../../store/Survey/types";
import { colors } from "../../layout/App/theme";

// TODO make bottom temp permanent once we work UI caveats
export const CHART_BOTTOM_TEMP_ENABLED = false;

export const filterDailyData = (
  dailyData: DailyData[],
  // Date strings, ISO preferred.
  from?: string,
  to?: string
): DailyData[] => {
  if (!from || !to) return dailyData;
  const startDate = moment(from);
  const endDate = moment(to);

  const ret = dailyData.filter((item) =>
    // add one since inRange is exclusive for last param
    inRange(
      moment(item.date).valueOf(),
      startDate.valueOf(),
      endDate.valueOf() + 1
    )
  );
  // if this list is empty, it means satellite is behind. We want to display latest value, so lets just return the latest values.
  if (ret.length === 0) {
    // daily data is separated by days, so lets try match the amount of days between the range given to us.
    const diffDays = endDate.diff(startDate, "days");
    return ret.slice(-diffDays);
  }
  return ret;
};

export const filterSofarData = (
  sofarData?: SofarValue[],
  from?: string,
  to?: string
): SofarValue[] => {
  if (!sofarData) {
    return [];
  }
  if (!from || !to) return sofarData;
  const startDate = moment(from);
  const endDate = moment(to);

  return sofarData.filter((item) =>
    inRange(
      moment(item.timestamp).valueOf(),
      startDate.valueOf(),
      endDate.valueOf() + 1
    )
  );
};

export const filterTimeSeriesData = (
  timeSeries?: TimeSeries,
  from?: string,
  to?: string
): TimeSeries | undefined => {
  if (!timeSeries) {
    return timeSeries;
  }

  return {
    dhw: filterSofarData(timeSeries?.dhw, from, to),
    satelliteTemperature: filterSofarData(
      timeSeries?.satelliteTemperature,
      from,
      to
    ),
    topTemperature: filterSofarData(timeSeries?.topTemperature, from, to),
    bottomTemperature: filterSofarData(timeSeries?.bottomTemperature, from, to),
    sstAnomaly: filterSofarData(timeSeries?.sstAnomaly, from, to),
    significantWaveHeight: filterSofarData(
      timeSeries?.significantWaveHeight,
      from,
      to
    ),
    tempAlert: filterSofarData(timeSeries?.tempAlert, from, to),
    tempWeeklyAlert: filterSofarData(timeSeries?.tempWeeklyAlert, from, to),
    waveMeanPeriod: filterSofarData(timeSeries?.waveMeanPeriod, from, to),
    waveMeanDirection: filterSofarData(timeSeries?.waveMeanDirection, from, to),
    windSpeed: filterSofarData(timeSeries?.windSpeed, from, to),
    windDirection: filterSofarData(timeSeries?.windDirection, from, to),
  };
};

const getSurveyDates = (surveys: SurveyListItem[]): (number | null)[] => {
  const dates = surveys.map((survey) => {
    if (survey.diveDate) {
      return new Date(survey.diveDate).setHours(0, 0, 0, 0);
    }
    return null;
  });

  return dates;
};

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

// Extend surface temperature line to the chart extremities.
export const augmentSurfaceTemperature = (
  surfaceTemperatureData: {
    x: string;
    y: number;
  }[],
  min: string,
  max: string
) => {
  if (surfaceTemperatureData.length > 0) {
    const firstData = surfaceTemperatureData[0];
    const lastData = surfaceTemperatureData[surfaceTemperatureData.length - 1];

    const firstDateExtension = moment(firstData.x).subtract(1, "days").format();
    const lastDateExtension = moment(lastData.x).add(1, "days").format();

    const startDate = isBefore(min, firstDateExtension)
      ? firstDateExtension
      : min;

    const endDate = isBefore(max, lastDateExtension) ? max : lastDateExtension;

    return [
      { x: startDate, y: firstData.y },
      ...surfaceTemperatureData,
      { x: endDate, y: lastData.y },
    ];
  }
  return surfaceTemperatureData;
};

export function getDailyDataClosestToDate(
  dailyData: DailyData[],
  date: Date,
  maxHours: number
) {
  if (dailyData.length > 0) {
    const closest = dailyData.reduce((prevClosest, nextPoint) =>
      timeDiff(prevClosest.date, date) > timeDiff(nextPoint.date, date)
        ? nextPoint
        : prevClosest
    );

    return timeDiff(closest.date, date) < maxHours * 60 * 60 * 1000
      ? closest
      : undefined;
  }
  return undefined;
}

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

export const createDatasets = (
  dailyData: DailyData[],
  rawSpotterBottom: SofarValue[],
  rawSpotterTop: SofarValue[],
  rawHoboBottom: SofarValue[],
  rawOceanSense: SofarValue[],
  historicalMonthlyMeanData: HistoricalMonthlyMeanData[],
  surveys: SurveyListItem[]
) => {
  const bottomTemperature = dailyData
    .filter((item) => item.avgBottomTemperature !== null)
    .map((item) => ({
      x: item.date,
      y: item.avgBottomTemperature,
    }));

  const surfaceTemperature = dailyData
    .filter((item) => item.satelliteTemperature !== null)
    .map((item) => ({ x: item.date, y: item.satelliteTemperature }));

  const surveyDates = getSurveyDates(surveys);

  const spotterBottom = rawSpotterBottom.map((item) => ({
    x: item.timestamp,
    y: item.value,
  }));

  const spotterTop = rawSpotterTop.map((item) => ({
    x: item.timestamp,
    y: item.value,
  }));

  const hoboBottom = rawHoboBottom.map((item) => ({
    x: item.timestamp,
    y: item.value,
  }));

  const oceanSense = rawOceanSense.map((item) => ({
    x: item.timestamp,
    y: item.value,
  }));

  const historicalMonthlyMeanTemp = historicalMonthlyMeanData.map((item) => ({
    x: item.date,
    y: item.value,
  }));

  const tempWithSurvey = dailyData
    .filter(
      (item) =>
        item.satelliteTemperature !== null &&
        surveyDates.some(
          (surveyDate) => surveyDate && sameDay(surveyDate, item.date)
        )
    )
    .map((item) => ({
      x: item.date,
      y:
        // Position survey on bottom temp, if enabled, else surface temp.
        (CHART_BOTTOM_TEMP_ENABLED && item.avgBottomTemperature) ||
        item.satelliteTemperature,
    }));

  return {
    tempWithSurvey,
    bottomTemperatureData: CHART_BOTTOM_TEMP_ENABLED ? bottomTemperature : [],
    surfaceTemperatureData: surfaceTemperature,
    spotterBottom,
    spotterTop,
    hoboBottom,
    oceanSense,
    historicalMonthlyMeanTemp,
  };
};

export const calculateAxisLimits = (
  dailyData: DailyData[],
  spotterBottomTemperature: SofarValue[],
  hoboTemperatureData: SofarValue[],
  oceanSenseData: SofarValue[],
  historicalMonthlyMeanData: HistoricalMonthlyMeanData[],
  spotterTopTemperature: SofarValue[],
  surveys: SurveyListItem[],
  temperatureThreshold: number | null
) => {
  const dates =
    dailyData.length > 0
      ? dailyData
          .filter(
            (item) =>
              item.topTemperature !== null || item.satelliteTemperature !== null
          )
          .map((item) => item.date)
      : spotterBottomTemperature.map((item) => item.timestamp);

  const spotterTimestamps = spotterBottomTemperature.map(
    (item) => item.timestamp
  );
  const spotterXMax = spotterTimestamps.slice(-1)[0];
  const spotterXMin = spotterTimestamps[0];

  const xAxisMax = spotterXMax || dates.slice(-1)[0];
  const xAxisMin = spotterXMin || dates[0];

  const {
    surfaceTemperatureData,
    bottomTemperatureData,
    spotterBottom,
    spotterTop,
    hoboBottom,
    oceanSense,
    historicalMonthlyMeanTemp,
  } = createDatasets(
    dailyData,
    spotterBottomTemperature,
    spotterTopTemperature,
    hoboTemperatureData,
    oceanSenseData,
    historicalMonthlyMeanData,
    surveys
  );

  const accumulatedData = [
    ...surfaceTemperatureData,
    ...bottomTemperatureData,
    ...spotterBottom,
    ...spotterTop,
    ...hoboBottom,
    ...oceanSense,
    ...historicalMonthlyMeanTemp,
  ]
    .filter((value) => value)
    .map((value) => value.y);

  const minValue = Math.min(...accumulatedData);
  const maxValue = Math.max(...accumulatedData);

  const spacingPercentage = 0.1;
  const ySpacing = Math.ceil(spacingPercentage * (maxValue - minValue)); // Set ySpacing as a percentage of the data range

  const yAxisMinTemp = minValue - ySpacing;

  const yAxisMaxTemp = maxValue + ySpacing;

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

  return {
    xAxisMax,
    xAxisMin,
    yAxisMin,
    yAxisMax,
  };
};

export function useProcessedChartData(
  dailyData: ChartProps["dailyData"],
  spotterData: ChartProps["spotterData"],
  hoboBottomTemperatureData: ChartProps["hoboBottomTemperatureData"],
  oceanSenseData: ChartProps["oceanSenseData"],
  historicalMonthlyMeanData: ChartProps["historicalMonthlyMeanData"],
  surveys: SurveyListItem[],
  temperatureThreshold: ChartProps["temperatureThreshold"],
  startDate: ChartProps["startDate"],
  endDate: ChartProps["endDate"]
) {
  // Sort daily data by date & in given date range, or latest data if no data found in range.
  const sortedFilteredDailyData = filterDailyData(
    sortByDate(dailyData, "date"),
    startDate,
    endDate
  );

  const { bottomTemperature, topTemperature } = spotterData || {};

  const datasets = createDatasets(
    sortedFilteredDailyData,
    bottomTemperature || [],
    topTemperature || [],
    hoboBottomTemperatureData || [],
    oceanSenseData || [],
    historicalMonthlyMeanData || [],
    surveys
  );

  const axisLimits = calculateAxisLimits(
    sortedFilteredDailyData,
    bottomTemperature || [],
    hoboBottomTemperatureData || [],
    oceanSenseData || [],
    historicalMonthlyMeanData || [],
    topTemperature || [],
    surveys,
    temperatureThreshold
  );
  return { sortedFilteredDailyData, ...axisLimits, ...datasets };
}

interface Context {
  chart?: Chart;
  dataIndex?: number;
  dataset?: Chart.ChartDataSets;
  datasetIndex?: number;
}

const fillColor = (threshold: number | null) => ({ chart }: Context) => {
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
      gradient.addColorStop(0, "rgba(250, 141, 0, 0.5)");
      gradient.addColorStop(ratio, "rgba(250, 141, 0, 0.5)");
      gradient.addColorStop(ratio, "rgb(107,193,225,0.2)");
      gradient.addColorStop(1, "rgb(107,193,225,0.2)");
    } else {
      gradient.addColorStop(0, "rgb(107,193,225,0.2)");
    }

    return gradient;
  }

  return "transparent";
};

const pointColor = (surveyDate: Date | null) => (context: Context) => {
  if (
    surveyDate &&
    context.dataset?.data &&
    typeof context.dataIndex === "number"
  ) {
    const chartPoint = context.dataset.data[context.dataIndex] as ChartPoint;
    const chartDate = new Date(chartPoint.x as string);
    return sameDay(surveyDate, chartDate) ? "#6bc1e1" : "white";
  }
  return "white";
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

export const createChartData = (
  spotterBottom: ChartPoint[],
  spotterTop: ChartPoint[],
  hoboBottom: ChartPoint[],
  oceanSense: ChartPoint[],
  tempWithSurvey: ChartPoint[],
  surfaceTemps: ChartPoint[],
  bottomTemps: ChartPoint[],
  historicalMonthlyMean: ChartPoint[],
  surveyDate: Date | null,
  temperatureThreshold: number | null,
  fill: boolean
) => {
  const displaySpotterData = spotterTop.length > 0;
  const data: ChartComponentProps["data"] = {
    datasets: [
      {
        type: "scatter",
        label: "SURVEYS",
        data: tempWithSurvey,
        pointRadius: 5,
        backgroundColor: "white",
        pointBackgroundColor: pointColor(surveyDate),
        borderWidth: 1.5,
        borderColor: "#128cc0",
      },
      {
        label: "SURFACE TEMP",
        data: createGaps(surfaceTemps, 48),
        fill,
        borderColor: "#6bc1e1",
        borderWidth: 2,
        pointBackgroundColor: "white",
        pointBorderWidth: 1.5,
        pointRadius: 0,
        cubicInterpolationMode: "monotone",
        backgroundColor: fillColor(temperatureThreshold),
      },
      {
        label: "MONTHLY MEAN",
        data: historicalMonthlyMean,
        fill: false,
        borderColor: "#d84424",
        borderWidth: 2,
        pointBackgroundColor: "white",
        pointBorderWidth: 1.5,
        pointRadius: 0,
        cubicInterpolationMode: "monotone",
      },
      {
        label: "TEMP AT DEPTH",
        data:
          CHART_BOTTOM_TEMP_ENABLED && !displaySpotterData
            ? createGaps(bottomTemps, 48)
            : undefined,
        borderColor: "#46a5cf",
        borderWidth: 2,
        pointBackgroundColor: "white",
        pointBorderWidth: 1.5,
        pointRadius: 0,
        cubicInterpolationMode: "monotone",
      },
      {
        label: "HOBO BOTTOM",
        data: createGaps(hoboBottom, 24),
        fill: false,
        borderColor: colors.specialSensorColor,
        borderWidth: 2,
        pointBackgroundColor: "white",
        pointBorderWidth: 1.5,
        pointRadius: 0,
        cubicInterpolationMode: "monotone",
      },
      {
        label: "OCEAN SENSE",
        data: createGaps(oceanSense, 6),
        fill: false,
        borderColor: colors.specialSensorColor,
        borderWidth: 2,
        pointBackgroundColor: "white",
        pointBorderWidth: 1.5,
        pointRadius: 0,
        cubicInterpolationMode: "monotone",
      },
      {
        label: "SPOTTER BOTTOM",
        data: createGaps(spotterBottom, 24),
        fill: false,
        borderColor: "rgba(250, 141, 0)",
        borderWidth: 2,
        pointBackgroundColor: "white",
        pointBorderWidth: 1.5,
        pointRadius: 0,
        cubicInterpolationMode: "monotone",
      },
      {
        label: "SPOTTER SURFACE",
        data: createGaps(spotterTop, 24),
        fill: false,
        borderColor: "#46a5cf",
        borderWidth: 2,
        pointBackgroundColor: "white",
        pointBorderWidth: 1.5,
        pointRadius: 0,
        cubicInterpolationMode: "monotone",
      },
    ],
  };

  return data;
};
