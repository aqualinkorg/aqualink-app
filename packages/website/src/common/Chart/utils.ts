import { ChartComponentProps } from "react-chartjs-2";
import type { ChartProps } from ".";
import { sortByDate } from "../../helpers/sortDailyData";
import type { DailyData, SofarValue } from "../../store/Reefs/types";
import { SurveyListItem } from "../../store/Survey/types";

// TODO make bottom temp permanent once we work UI caveats
export const CHART_BOTTOM_TEMP_ENABLED = false;

const isBetween = (date: Date, start: Date, end: Date): boolean => {
  return date.getTime() >= start.getTime() && date.getTime() <= end.getTime();
};

export const filterData = (
  from: string,
  to: string,
  dailyData: DailyData[]
): DailyData[] => {
  const startDate = new Date(from);
  const endDate = new Date(to);
  return dailyData.filter((item) =>
    isBetween(new Date(item.date), startDate, endDate)
  );
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

export const createDatasets = (
  dailyData: DailyData[],
  spotterBottomTemperature: SofarValue[],
  spotterSurfaceTemperature: SofarValue[],
  surveys: SurveyListItem[]
) => {
  const bottomTemperature = dailyData.map((item) => item.avgBottomTemperature);
  const surfaceTemperature = dailyData
    .filter((item) => item.satelliteTemperature !== null)
    .map((item) => item.satelliteTemperature);

  const surveyDates = getSurveyDates(surveys);

  const spotterBottom = spotterBottomTemperature.map((item) => item.value);
  const spotterSurface = spotterSurfaceTemperature.map((item) => item.value);

  const tempWithSurvey = dailyData
    .filter((item) => item.satelliteTemperature !== null)
    .map((item) => {
      const date = new Date(item.date).setHours(0, 0, 0, 0);
      if (surveyDates.includes(date)) {
        return (
          // prioritise bottom temp, if enabled
          (CHART_BOTTOM_TEMP_ENABLED && item.avgBottomTemperature) ||
          item.satelliteTemperature
        );
      }
      return null;
    });

  return {
    // repeat first value, so chart start point isn't instantaneous.
    tempWithSurvey: [tempWithSurvey[0], ...tempWithSurvey],
    bottomTemperatureData: [
      bottomTemperature[0],
      ...bottomTemperature,
      bottomTemperature.slice(-1)[0],
    ],
    surfaceTemperatureData: [
      surfaceTemperature[0],
      ...surfaceTemperature,
      surfaceTemperature.slice(-1)[0],
    ],
    spotterBottom:
      spotterBottom.length > 0 ? [spotterBottom[0], ...spotterBottom] : [],
    spotterSurface:
      spotterSurface.length > 0 ? [spotterSurface[0], ...spotterSurface] : [],
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

  const xAxisMin =
    spotterXMin ||
    new Date(new Date(dates[0]).setHours(-1, 0, 0, 0)).toISOString();

  // Add an extra date one day after the final daily data date
  const chartLabels = [xAxisMin, ...dates, xAxisMax];

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
    ...(CHART_BOTTOM_TEMP_ENABLED ? bottomTemperatureData : []),
    ...spotterBottom,
    ...spotterSurface,
  ].filter((value) => value);

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
    chartLabels,
  };
};

export function useProcessedChartData(
  dailyData: ChartProps["dailyData"],
  spotterData: ChartProps["spotterData"],
  surveys: SurveyListItem[],
  temperatureThreshold: ChartProps["temperatureThreshold"]
) {
  // Sort daily data by date
  const sortedDailyData = sortByDate(dailyData, "date");

  const { bottomTemperature, surfaceTemperature } = spotterData || {};

  const datasets = createDatasets(
    sortedDailyData,
    bottomTemperature || [],
    surfaceTemperature || [],
    surveys
  );

  const axisLimits = calculateAxisLimits(
    sortedDailyData,
    bottomTemperature || [],
    surfaceTemperature || [],
    surveys,
    temperatureThreshold
  );
  return { sortedDailyData, ...axisLimits, ...datasets };
}

export const createChartData = (
  labels: string[],
  spotterBottom: SofarValue[],
  spotterSurface: SofarValue[],
  tempWithSurvey: (number | null)[],
  surfaceTemps: number[],
  bottomTemps: number[],
  fill: boolean
) => {
  const displaySpotterData = spotterSurface.length > 0;
  const data: ChartComponentProps["data"] = {
    labels,
    datasets: [
      {
        type: "scatter",
        label: "SURVEYS",
        data: tempWithSurvey,
        pointRadius: 5,
        backgroundColor: "#ffffff",
        pointBackgroundColor: "#ffff",
        borderWidth: 1.5,
        borderColor: "#128cc0",
      },
      {
        label: "SURFACE TEMP",
        data: surfaceTemps,
        fill: !displaySpotterData,
        backgroundColor: "rgb(107,193,225,0.2)",
        borderColor: "#6bc1e1",
        borderWidth: 2,
        pointBackgroundColor: "#ffffff",
        pointBorderWidth: 1.5,
        pointRadius: 0,
        cubicInterpolationMode: "monotone",
      },
      {
        label: "TEMP AT DEPTH",
        data: CHART_BOTTOM_TEMP_ENABLED ? bottomTemps : undefined,
        borderColor: "#46a5cf",
        borderWidth: 2,
        pointBackgroundColor: "#ffffff",
        pointBorderWidth: 1.5,
        pointRadius: 0,
        cubicInterpolationMode: "monotone",
      },
      {
        label: "SPOTTER BOTTOM",
        data: spotterBottom.map((item) => ({
          x: item.timestamp,
          y: item.value,
        })),
        backgroundColor: "rgb(107,193,225,0.2)",
        borderColor: "#46a5cf",
        borderWidth: 2,
        pointBackgroundColor: "#ffffff",
        pointBorderWidth: 1.5,
        pointRadius: 0,
        cubicInterpolationMode: "monotone",
      },
      {
        label: "SPOTTER SURFACE",
        data: spotterSurface.map((item) => ({
          x: item.timestamp,
          y: item.value,
        })),
        backgroundColor: "rgb(107,193,225,0.2)",
        borderColor: "#6bc1e1",
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

export function sameDay(date1: string | number, date2: string | number | Date) {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

const timeDiff = (incomingDate: string, date: Date) =>
  Math.abs(new Date(incomingDate).getTime() - date.getTime());

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
  const closest = spotterData.reduce((prevClosest, nextPoint) =>
    timeDiff(prevClosest.timestamp, date) > timeDiff(nextPoint.timestamp, date)
      ? nextPoint
      : prevClosest
  );

  return timeDiff(closest.timestamp, date) < maxHours * 60 * 60 * 1000
    ? closest
    : undefined;
}
