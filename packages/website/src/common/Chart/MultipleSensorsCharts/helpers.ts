import { utcToZonedTime } from "date-fns-tz";
import { minBy, maxBy, meanBy } from "lodash";
import moment from "moment";
import {
  findMarginalDate,
  generateHistoricalMonthlyMeanTimestamps,
} from "../../../helpers/dates";

import {
  DailyData,
  DataRange,
  HistoricalMonthlyMean,
  HistoricalMonthlyMeanData,
  OceanSenseData,
  OceanSenseKeys,
  SofarValue,
  TimeSeriesData,
} from "../../../store/Reefs/types";
import { filterHistoricalMonthlyMeanData } from "../utils";
import { CardColumn, Dataset, OceanSenseDataset } from "./types";

export const calculateCardMetrics = (
  minNumberOfPoints: number,
  data?: (HistoricalMonthlyMeanData | SofarValue)[],
  keyPrefix?: string
): CardColumn["rows"] => [
  {
    key: `${keyPrefix}-max`,
    value: data?.[minNumberOfPoints - 1]
      ? maxBy(data, "value")?.value
      : undefined,
  },
  {
    key: `${keyPrefix}-mean`,
    value: data?.[minNumberOfPoints - 1] ? meanBy(data, "value") : undefined,
  },
  {
    key: `${keyPrefix}-min`,
    value: data?.[minNumberOfPoints - 1]
      ? minBy(data, "value")?.value
      : undefined,
  },
];

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
  const { hobo, spotter } = timeSeriesData || {};
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
      spotter?.bottomTemperature?.[0] ||
      spotter?.topTemperature?.[0] ||
      hobo?.bottomTemperature?.[0]
  );

  return [
    hasData
      ? new Date(
          findMarginalDate(
            filteredHistoricalMonthlyMeanData,
            dailyData || [],
            spotter,
            hobo?.bottomTemperature || [],
            "min"
          )
        ).toISOString()
      : undefined,
    hasData
      ? new Date(
          findMarginalDate(
            filteredHistoricalMonthlyMeanData,
            dailyData || [],
            spotter,
            hobo?.bottomTemperature || []
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
  },
  EC: {
    data: data?.EC || [],
    unit: "μS",
    title: "CONDUCTIVITY (μS)",
  },
  PRESS: {
    data: data?.PRESS || [],
    unit: "dbar",
    title: "PRESSURE (dbar)",
  },
  DO: {
    data: data?.DO || [],
    unit: "mg/L",
    title: "DISSOLVED OXYGEN (mg/L)",
  },
  ORP: {
    data: data?.ORP || [],
    unit: "mV",
    title: "OXIDATION REDUCTION POTENTIAL (mV)",
  },
});
