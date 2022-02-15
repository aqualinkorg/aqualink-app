import { utcToZonedTime } from "date-fns-tz";
import { minBy, maxBy, meanBy, inRange } from "lodash";
import moment from "moment";
import {
  convertDailyDataToLocalTime,
  convertSofarDataToLocalTime,
  findMarginalDate,
  generateHistoricalMonthlyMeanTimestamps,
} from "../../../helpers/dates";

import {
  DailyData,
  DataRange,
  HistoricalMonthlyMean,
  OceanSenseData,
  OceanSenseKeys,
  SofarValue,
  TimeSeriesData,
} from "../../../store/Sites/types";
import { CardColumn, Dataset, OceanSenseDataset } from "./types";
import type { Dataset as ChartDataset } from "../index";
import {
  DAILY_DATA_CURVE_COLOR,
  HISTORICAL_MONTHLY_MEAN_COLOR,
  HOBO_BOTTOM_DATA_CURVE_COLOR,
  MIN_NUMBER_OF_POINTS,
  SPOTTER_BOTTOM_DATA_CURVE_COLOR,
  SPOTTER_METRIC_DATA_COLOR,
  SPOTTER_TOP_DATA_CURVE_COLOR,
} from "../../../constants/charts";
import {
  convertDailyToSofar,
  convertHistoricalMonthlyMeanToSofar,
  filterHistoricalMonthlyMeanData,
} from "../utils";

export const calculateCardMetrics = (
  minNumberOfPoints: number,
  from: string,
  to: string,
  data?: SofarValue[],
  keyPrefix?: string
): CardColumn["rows"] => {
  const filteredData = data?.filter(({ timestamp }) =>
    inRange(
      moment(timestamp).valueOf(),
      moment(from).valueOf(),
      moment(to).valueOf() + 1
    )
  );

  return [
    {
      key: `${keyPrefix}-max`,
      value: filteredData?.[minNumberOfPoints - 1]
        ? maxBy(filteredData, "value")?.value
        : undefined,
    },
    {
      key: `${keyPrefix}-mean`,
      value: filteredData?.[minNumberOfPoints - 1]
        ? meanBy(filteredData, "value")
        : undefined,
    },
    {
      key: `${keyPrefix}-min`,
      value: filteredData?.[minNumberOfPoints - 1]
        ? minBy(filteredData, "value")?.value
        : undefined,
    },
  ];
};

// Show at least 3 ticks on the chart
export const findChartPeriod = (startDate: string, endDate: string) => {
  const from = moment(new Date(startDate).toISOString());
  const to = moment(new Date(endDate).toISOString());
  const week = 7;
  const month = 30;
  const diffDays = to.diff(from, "days");

  switch (true) {
    case diffDays < 2:
      return "hour";
    case diffDays < 3 * week:
      return "day";
    case diffDays < 3 * month:
      return "week";
    default:
      return "month";
  }
};

export const findDataLimits = (
  historicalMonthlyMean: HistoricalMonthlyMean[],
  dailyData: DailyData[] | undefined,
  timeSeriesData: TimeSeriesData | undefined,
  startDate: string | undefined,
  endDate: string | undefined
): [string | undefined, string | undefined] => {
  const { bottomTemperature, topTemperature } = timeSeriesData || {};
  const historicalMonthlyMeanData = generateHistoricalMonthlyMeanTimestamps(
    historicalMonthlyMean,
    startDate,
    endDate
  );
  const filteredHistoricalMonthlyMeanData = filterHistoricalMonthlyMeanData(
    historicalMonthlyMeanData,
    startDate,
    endDate
  );

  const hasData = Boolean(
    filteredHistoricalMonthlyMeanData?.[0] ||
      dailyData?.[0] ||
      bottomTemperature?.spotter?.data?.[0] ||
      topTemperature?.spotter?.data?.[0] ||
      bottomTemperature?.hobo?.data?.[0]
  );

  return [
    hasData
      ? new Date(
          findMarginalDate(
            filteredHistoricalMonthlyMeanData,
            dailyData || [],
            bottomTemperature?.spotter?.data,
            topTemperature?.spotter?.data,
            bottomTemperature?.hobo?.data,
            "min"
          )
        ).toISOString()
      : undefined,
    hasData
      ? new Date(
          findMarginalDate(
            filteredHistoricalMonthlyMeanData,
            dailyData || [],
            bottomTemperature?.spotter?.data,
            topTemperature?.spotter?.data,
            bottomTemperature?.hobo?.data
          )
        ).toISOString()
      : undefined,
  ];
};

export const findCardDataset = (
  hasSpotterData: boolean,
  hasHoboData: boolean
): Dataset => {
  switch (true) {
    case hasSpotterData:
      return "spotter";
    case hasHoboData:
      return "hobo";
    default:
      return "sst";
  }
};

export const availableRangeString = (
  sensor: string,
  range?: DataRange,
  timeZone?: string | null
): string | undefined => {
  const { minDate, maxDate } = range || {};
  const formattedStartDate = minDate
    ? moment(utcToZonedTime(minDate, timeZone || "UTC")).format("MM/DD/YYYY")
    : undefined;
  const formattedEndDate = maxDate
    ? moment(utcToZonedTime(maxDate, timeZone || "UTC")).format("MM/DD/YYYY")
    : undefined;
  return formattedStartDate && formattedEndDate
    ? `${sensor} range: ${formattedStartDate} - ${formattedEndDate}`
    : undefined;
};

/**
 * Determines if the input dates differ by more than one year
 * @param startDate - The starting date
 * @param endDate - The ending date
 */
export const moreThanOneYear = (startDate: string, endDate: string) => {
  const from = moment(startDate);
  const to = moment(endDate);
  return to.diff(from, "years") >= 1;
};

export const localizedEndOfDay = (
  date?: string,
  timeZone?: string | null | undefined
): string =>
  moment(date)
    .tz(timeZone || "UTC")
    .endOf("day")
    .toISOString();

export const constructOceanSenseDatasets = (
  data?: OceanSenseData
): Record<OceanSenseKeys, OceanSenseDataset> => ({
  PH: {
    data: data?.PH || [],
    unit: "pH",
    title: "ACIDITY (pH)",
    id: "acidity",
  },
  EC: {
    data: data?.EC || [],
    unit: "μS",
    title: "CONDUCTIVITY (μS)",
    id: "conductivity",
  },
  PRESS: {
    data: data?.PRESS || [],
    unit: "dbar",
    title: "PRESSURE (dbar)",
    id: "pressure",
  },
  DO: {
    data: data?.DO || [],
    unit: "mg/L",
    title: "DISSOLVED OXYGEN (mg/L)",
    id: "dissolved_oxygen",
  },
  ORP: {
    data: data?.ORP || [],
    unit: "mV",
    title: "OXIDATION REDUCTION POTENTIAL (mV)",
    id: "oxidation_reduction_potential",
  },
});

export const hasAtLeastNData = (n: number, data?: SofarValue[]) =>
  typeof data?.length === "number" && data.length >= n;

export const generateTempAnalysisDatasets = (
  dailyData?: DailyData[],
  spotterBottom?: SofarValue[],
  spotterTop?: SofarValue[],
  hoboBottom?: SofarValue[],
  historicalMonthlyMean?: HistoricalMonthlyMean[],
  startDate?: string,
  endDate?: string,
  timezone?: string | null,
  depth?: number | null
): ChartDataset[] => {
  const localDailyData =
    convertDailyToSofar(
      convertDailyDataToLocalTime(dailyData || [], timezone),
      ["satelliteTemperature"]
    )?.satelliteTemperature || [];
  const localMonthlyMeanData =
    convertHistoricalMonthlyMeanToSofar(
      generateHistoricalMonthlyMeanTimestamps(
        historicalMonthlyMean || [],
        startDate,
        endDate,
        timezone
      )
    ) || [];
  const localSpotterBottomData = convertSofarDataToLocalTime(spotterBottom);
  const localSpotterTopData = convertSofarDataToLocalTime(spotterTop);
  const localHoboBottomData = convertSofarDataToLocalTime(
    hoboBottom || [],
    timezone
  );
  const hasEnoughSpotterBottomData = hasAtLeastNData(
    MIN_NUMBER_OF_POINTS,
    localSpotterBottomData
  );
  const hasEnoughSpotterTopData = hasAtLeastNData(
    MIN_NUMBER_OF_POINTS,
    localSpotterTopData
  );
  const hasEnoughHoboBottomData = hasAtLeastNData(
    MIN_NUMBER_OF_POINTS,
    localHoboBottomData
  );
  const hasEnoughDailyData = hasAtLeastNData(
    MIN_NUMBER_OF_POINTS,
    localDailyData
  );
  const hasEnoughMonthlyMeanData = hasAtLeastNData(
    MIN_NUMBER_OF_POINTS,
    localMonthlyMeanData
  );

  return [
    {
      label: "SURFACE",
      data: localDailyData,
      curveColor: DAILY_DATA_CURVE_COLOR,
      maxHoursGap: 48,
      tooltipMaxHoursGap: 24,
      type: "line",
      unit: "°C",
      surveysAttached: true,
      isDailyUpdated: true,
      displayData:
        !hasEnoughSpotterBottomData &&
        !hasEnoughSpotterTopData &&
        !hasEnoughHoboBottomData &&
        hasEnoughDailyData,
    },
    {
      label: "MONTHLY MEAN",
      cardColumnName: "HISTORIC",
      cardColumnTooltip:
        "Historic long-term average of satellite surface temperature",
      data: localMonthlyMeanData,
      curveColor: HISTORICAL_MONTHLY_MEAN_COLOR,
      type: "line",
      unit: "°C",
      tooltipMaxHoursGap: 24 * 15,
      displayData:
        hasEnoughMonthlyMeanData &&
        (hasEnoughSpotterBottomData ||
          hasEnoughSpotterTopData ||
          hasEnoughHoboBottomData ||
          hasEnoughDailyData),
    },
    {
      label: `BUOY ${depth}m`,
      data: localSpotterBottomData,
      curveColor: SPOTTER_BOTTOM_DATA_CURVE_COLOR,
      type: "line",
      unit: "°C",
      maxHoursGap: 24,
      tooltipMaxHoursGap: 6,
      displayData: hasAtLeastNData(
        MIN_NUMBER_OF_POINTS,
        localSpotterBottomData
      ),
    },
    {
      label: "BUOY 1m",
      data: localSpotterTopData,
      curveColor: SPOTTER_TOP_DATA_CURVE_COLOR,
      type: "line",
      unit: "°C",
      maxHoursGap: 24,
      tooltipMaxHoursGap: 6,
      displayData: hasAtLeastNData(MIN_NUMBER_OF_POINTS, localSpotterTopData),
    },
    {
      label: "HOBO",
      data: localHoboBottomData,
      curveColor: HOBO_BOTTOM_DATA_CURVE_COLOR,
      type: "line",
      unit: "°C",
      maxHoursGap: 24,
      tooltipMaxHoursGap: 6,
      displayData:
        !hasEnoughSpotterBottomData &&
        !hasEnoughSpotterTopData &&
        hasEnoughHoboBottomData,
    },
  ];
};

export const generateSpotterMetricDataset = (
  label: string,
  data: SofarValue[],
  unit: string
): ChartDataset => ({
  label,
  data: convertSofarDataToLocalTime(data),
  unit,
  curveColor: SPOTTER_METRIC_DATA_COLOR,
  type: "line",
  maxHoursGap: 24,
  tooltipMaxHoursGap: 6,
  displayData: true,
});
