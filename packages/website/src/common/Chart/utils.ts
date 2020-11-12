import type { ChartPoint } from "chart.js";
import { ChartComponentProps } from "react-chartjs-2";
import moment from "moment";
import { inRange } from "lodash";
import type { ChartProps } from ".";
import { sortByDate } from "../../helpers/sortDailyData";
import type {
  DailyData,
  SofarValue,
  SpotterData,
} from "../../store/Reefs/types";
import { SurveyListItem } from "../../store/Survey/types";

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
    inRange(moment(item.date).date(), startDate.date(), endDate.date() + 1)
  );
  // if this list is empty, it means satellite is behind. We want to display latest value, so lets just return the latest values.
  if (ret.length === 0) {
    // daily data is separated by days, so lets try match the amount of days between the range given to us.
    const diffDays = endDate.diff(startDate, "days");
    return ret.slice(-diffDays);
  }
  return ret;
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

export function getDailyDataClosestToDate(dailyData: DailyData[], date: Date) {
  return dailyData.reduce((prevClosest, nextPoint) =>
    timeDiff(prevClosest.date, date) > timeDiff(nextPoint.date, date)
      ? nextPoint
      : prevClosest
  );
}

export function getSpotterDataClosestToDate(
  spotterData: SofarValue[],
  date: Date,
  maxHours: number
) {
  if (spotterData.length === 0) {
    return undefined;
  }

  const closest = spotterData.reduce((prevClosest, nextPoint) =>
    timeDiff(prevClosest.timestamp, date) > timeDiff(nextPoint.timestamp, date)
      ? nextPoint
      : prevClosest
  );

  return timeDiff(closest.timestamp, date) < maxHours * 60 * 60 * 1000
    ? closest
    : undefined;
}

export const createDatasets = (
  dailyData: DailyData[],
  rawSpotterBottom: SpotterData["bottomTemperature"],
  rawSpotterSurface: SpotterData["surfaceTemperature"],
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

  const spotterSurface = rawSpotterSurface.map((item) => ({
    x: item.timestamp,
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
    spotterSurface,
  };
};

export const calculateAxisLimits = (
  dailyData: DailyData[],
  spotterBottomTemperature: SofarValue[],
  spotterSurfaceTemperature: SofarValue[],
  surveys: SurveyListItem[],
  temperatureThreshold: number | null
) => {
  const ySpacing = 1;
  const dates =
    dailyData.length > 0
      ? dailyData
          .filter(
            (item) =>
              item.surfaceTemperature !== null ||
              item.satelliteTemperature !== null
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
    spotterSurface,
  } = createDatasets(
    dailyData,
    spotterBottomTemperature,
    spotterSurfaceTemperature,
    surveys
  );

  const temperatureData = [
    ...surfaceTemperatureData,
    ...bottomTemperatureData,
    ...spotterBottom,
    ...spotterSurface,
  ]
    .filter((value) => value)
    .map((value) => value.y);

  const yAxisMinTemp = Math.min(...temperatureData) - ySpacing;

  const yAxisMaxTemp = Math.max(...temperatureData) + ySpacing;

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

  const { bottomTemperature, surfaceTemperature } = spotterData || {};

  const datasets = createDatasets(
    sortedFilteredDailyData,
    bottomTemperature || [],
    surfaceTemperature || [],
    surveys
  );

  const axisLimits = calculateAxisLimits(
    sortedFilteredDailyData,
    bottomTemperature || [],
    surfaceTemperature || [],
    surveys,
    temperatureThreshold
  );
  return { sortedFilteredDailyData, ...axisLimits, ...datasets };
}

export const createChartData = (
  spotterBottom: ChartPoint[],
  spotterSurface: ChartPoint[],
  tempWithSurvey: ChartPoint[],
  surfaceTemps: ChartPoint[],
  bottomTemps: ChartPoint[],
  surveyDate: Date | null,
  fill: boolean
) => {
  const displaySpotterData = spotterSurface.length > 0;
  const data: ChartComponentProps["data"] = {
    datasets: [
      {
        type: "scatter",
        label: "SURVEYS",
        data: tempWithSurvey,
        pointRadius: 5,
        backgroundColor: "#ffffff",
        pointBackgroundColor: (context) => {
          if (
            surveyDate &&
            context.dataset?.data &&
            typeof context.dataIndex === "number"
          ) {
            const index = context.dataIndex;
            const chartPoint = context.dataset.data[index] as ChartPoint;
            const chartDate = new Date(chartPoint.x as string);
            return sameDay(surveyDate, chartDate) ? "#6bc1e1" : "#ffffff";
          }
          return "#ffffff";
        },
        borderWidth: 1.5,
        borderColor: "#128cc0",
      },
      {
        label: "SURFACE TEMP",
        data: surfaceTemps,
        fill: !displaySpotterData,
        borderColor: "#6bc1e1",
        borderWidth: 2,
        pointBackgroundColor: "#ffffff",
        pointBorderWidth: 1.5,
        pointRadius: 0,
        cubicInterpolationMode: "monotone",
        backgroundColor: "rgb(107,193,225,0.2)",
      },
      {
        label: "TEMP AT DEPTH",
        data:
          CHART_BOTTOM_TEMP_ENABLED && !displaySpotterData
            ? bottomTemps
            : undefined,
        borderColor: "#46a5cf",
        borderWidth: 2,
        pointBackgroundColor: "#ffffff",
        pointBorderWidth: 1.5,
        pointRadius: 0,
        cubicInterpolationMode: "monotone",
      },
      {
        label: "SPOTTER BOTTOM",
        data: spotterBottom,
        fill: false,
        borderColor: "rgba(250, 141, 0)",
        borderWidth: 2,
        pointBackgroundColor: "#ffffff",
        pointBorderWidth: 1.5,
        pointRadius: 0,
        cubicInterpolationMode: "monotone",
      },
      {
        label: "SPOTTER SURFACE",
        data: spotterSurface,
        fill: false,
        borderColor: "#46a5cf",
        borderWidth: 2,
        pointBackgroundColor: "#ffffff",
        pointBorderWidth: 1.5,
        pointRadius: 0,
        cubicInterpolationMode: "monotone",
      },
    ],
  };

  if (fill) {
    // eslint-disable-next-line fp/no-mutating-methods
    data.datasets!.splice(1, 0, {
      label: "BLEACHING THRESHOLD",
      data: surfaceTemps,
      fill,
      borderColor: "#6bc1e1",
      borderWidth: 2,
      pointBackgroundColor: "#ffffff",
      pointBorderWidth: 1.5,
      pointRadius: 0,
      cubicInterpolationMode: "monotone",
    });
  }
  return data;
};
