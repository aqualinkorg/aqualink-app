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
        return item.satelliteTemperature;
      }
      return null;
    });

  return {
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

  const { surfaceTemperatureData } = createDatasets(dailyData, surveys);

  const temperatureData = [...surfaceTemperatureData].filter((value) => value);

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
