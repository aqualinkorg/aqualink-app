import { ChartComponentProps } from "react-chartjs-2";
import type { ChartProps } from ".";
import { sortByDate } from "../../helpers/sortDailyData";
import type { DailyData } from "../../store/Reefs/types";
import { SurveyListItem } from "../../store/Survey/types";

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
  surveys: SurveyListItem[]
) => {
  const bottomTemperature = dailyData.map((item) => item.avgBottomTemperature);
  const surfaceTemperature = dailyData
    .filter((item) => item.satelliteTemperature !== null)
    .map((item) => item.satelliteTemperature);

  const surveyDates = getSurveyDates(surveys);

  const tempWithSurvey = dailyData
    .filter((item) => item.satelliteTemperature !== null)
    .map((item) => {
      const date = new Date(item.date).setHours(0, 0, 0, 0);
      if (surveyDates.includes(date)) {
        return item.avgBottomTemperature || item.satelliteTemperature;
      }
      return null;
    });

  return {
    // repeat first value, so chart start point isn't instantaneous.
    tempWithSurvey: [tempWithSurvey[0], ...tempWithSurvey],
    bottomTemperatureData: [bottomTemperature[0], ...bottomTemperature],
    surfaceTemperatureData: [surfaceTemperature[0], ...surfaceTemperature],
  };
};

export const calculateAxisLimits = (
  dailyData: DailyData[],
  surveys: SurveyListItem[],
  temperatureThreshold: number | null
) => {
  const ySpacing = 1;
  const dates = dailyData
    .filter(
      (item) =>
        item.surfaceTemperature !== null || item.satelliteTemperature !== null
    )
    .map((item) => item.date);
  const dailyDataLen = dates.length;

  const xAxisMax = new Date(new Date(dates[dailyDataLen - 1])).toISOString();

  const xAxisMin = new Date(
    new Date(dates[0]).setHours(-1, 0, 0, 0)
  ).toISOString();

  // Add an extra date one day after the final daily data date
  const chartLabels = [xAxisMin, ...dates];

  const { surfaceTemperatureData, bottomTemperatureData } = createDatasets(
    dailyData,
    surveys
  );

  const temperatureData = [
    ...surfaceTemperatureData,
    ...bottomTemperatureData,
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
  surveys: SurveyListItem[],
  temperatureThreshold: ChartProps["temperatureThreshold"]
) {
  // Sort daily data by date
  const sortedDailyData = sortByDate(dailyData, "date");

  const datasets = createDatasets(sortedDailyData, surveys);

  const axisLimits = calculateAxisLimits(
    sortedDailyData,
    surveys,
    temperatureThreshold
  );
  return { sortedDailyData, ...axisLimits, ...datasets };
}

export const createChartData = (
  labels: string[],
  tempWithSurvey: (number | null)[],
  surfaceTemps: number[],
  bottomTemps: number[],
  fill: boolean
) => {
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
        data: bottomTemps,
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
