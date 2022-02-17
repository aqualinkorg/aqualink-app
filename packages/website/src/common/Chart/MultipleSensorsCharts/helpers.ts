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
import { CardColumn, OceanSenseDataset } from "./types";
import type { Dataset } from "../index";
import {
  DAILY_DATA_CURVE_COLOR,
  HISTORICAL_MONTHLY_MEAN_COLOR,
  HOBO_BOTTOM_DATA_CURVE_COLOR,
  CHART_MIN_NUMBER_OF_POINTS,
  SPOTTER_BOTTOM_DATA_CURVE_COLOR,
  SPOTTER_TOP_DATA_CURVE_COLOR,
} from "../../../constants/charts";
import {
  convertDailyToSofar,
  convertHistoricalMonthlyMeanToSofar,
  filterHistoricalMonthlyMeanData,
} from "../utils";

export const filterSofarData = (
  data?: SofarValue[],
  from?: string,
  to?: string
) => {
  if (!from || !to || !data) {
    return data;
  }

  return data?.filter(({ timestamp }) =>
    inRange(
      moment(timestamp).valueOf(),
      moment(from).valueOf(),
      moment(to).valueOf() + 1
    )
  );
};

export const calculateCardMetrics = (
  from: string,
  to: string,
  data?: SofarValue[],
  keyPrefix?: string
): CardColumn["rows"] => {
  const filteredData = filterSofarData(data, from, to);

  return [
    {
      key: `${keyPrefix}-max`,
      value: filteredData?.[0]
        ? maxBy(filteredData, "value")?.value
        : undefined,
    },
    {
      key: `${keyPrefix}-mean`,
      value: filteredData?.[0] ? meanBy(filteredData, "value") : undefined,
    },
    {
      key: `${keyPrefix}-min`,
      value: filteredData?.[0]
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

export const findChartWidth = (
  datasets: Dataset[]
): "small" | "medium" | "large" => {
  const nCardColumns = datasets.filter(
    ({ displayCardColumn }) => displayCardColumn
  ).length;

  switch (true) {
    case nCardColumns === 3:
      return "small";
    case nCardColumns === 2:
      return "large";
    case nCardColumns === 1:
      return "large";
    default:
      return "small";
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
  chartStartDate?: string,
  chartEndDate?: string,
  timezone?: string | null,
  depth?: number | null
): Dataset[] => {
  const localDailyData =
    convertDailyToSofar(
      convertDailyDataToLocalTime(dailyData || [], timezone),
      ["satelliteTemperature"]
    )?.satelliteTemperature || [];
  const localMonthlyMeanData =
    convertHistoricalMonthlyMeanToSofar(
      filterHistoricalMonthlyMeanData(
        generateHistoricalMonthlyMeanTimestamps(
          historicalMonthlyMean || [],
          startDate,
          endDate,
          timezone
        ),
        chartStartDate,
        chartEndDate
      )
    ) || [];
  const localSpotterBottomData = convertSofarDataToLocalTime(
    spotterBottom,
    timezone
  );
  const localSpotterTopData = convertSofarDataToLocalTime(spotterTop, timezone);
  const localHoboBottomData = convertSofarDataToLocalTime(
    hoboBottom || [],
    timezone
  );
  const hasEnoughSpotterBottomData = hasAtLeastNData(
    CHART_MIN_NUMBER_OF_POINTS,
    filterSofarData(localSpotterBottomData, chartStartDate, chartEndDate)
  );
  const hasEnoughSpotterTopData = hasAtLeastNData(
    CHART_MIN_NUMBER_OF_POINTS,
    filterSofarData(localSpotterTopData, chartStartDate, chartEndDate)
  );
  const hasEnoughHoboBottomData = hasAtLeastNData(
    CHART_MIN_NUMBER_OF_POINTS,
    filterSofarData(localHoboBottomData, chartStartDate, chartEndDate)
  );
  const hasEnoughDailyData = hasAtLeastNData(
    CHART_MIN_NUMBER_OF_POINTS,
    filterSofarData(localDailyData, chartStartDate, chartEndDate)
  );
  const hasEnoughMonthlyMeanData = hasAtLeastNData(1, localMonthlyMeanData);

  return [
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
      displayData: hasEnoughMonthlyMeanData,
      displayCardColumn:
        hasEnoughMonthlyMeanData &&
        (hasEnoughSpotterBottomData ||
          hasEnoughSpotterTopData ||
          hasEnoughHoboBottomData ||
          hasEnoughDailyData),
    },
    {
      label: "SURFACE",
      data: localDailyData,
      curveColor: DAILY_DATA_CURVE_COLOR,
      maxHoursGap: 48,
      tooltipMaxHoursGap: 24,
      type: "line",
      unit: "°C",
      cardColumnName: "SST",
      surveysAttached: true,
      isDailyUpdated: true,
      displayData: hasEnoughDailyData,
      displayCardColumn:
        !hasEnoughSpotterBottomData &&
        !hasEnoughSpotterTopData &&
        !hasEnoughHoboBottomData &&
        hasEnoughDailyData,
    },
    {
      label: `BUOY ${depth}m`,
      data: localSpotterBottomData,
      curveColor: SPOTTER_BOTTOM_DATA_CURVE_COLOR,
      type: "line",
      unit: "°C",
      maxHoursGap: 24,
      tooltipMaxHoursGap: 6,
      displayData: hasEnoughSpotterBottomData,
      displayCardColumn: hasEnoughSpotterBottomData,
    },
    {
      label: "BUOY 1m",
      data: localSpotterTopData,
      curveColor: SPOTTER_TOP_DATA_CURVE_COLOR,
      type: "line",
      unit: "°C",
      maxHoursGap: 24,
      tooltipMaxHoursGap: 6,
      displayData: hasEnoughSpotterTopData,
      displayCardColumn: hasEnoughSpotterTopData,
    },
    {
      label: "HOBO",
      data: localHoboBottomData,
      curveColor: HOBO_BOTTOM_DATA_CURVE_COLOR,
      type: "line",
      unit: "°C",
      maxHoursGap: 24,
      tooltipMaxHoursGap: 6,
      tooltipLabel: "HOBO LOGGER",
      displayData: hasEnoughHoboBottomData,
      displayCardColumn:
        !hasEnoughSpotterBottomData &&
        !hasEnoughSpotterTopData &&
        hasEnoughHoboBottomData,
    },
  ];
};

export const generateMetricDataset = (
  label: string,
  data: SofarValue[],
  unit: string,
  color: string,
  chartStartDate?: string,
  chartEndDate?: string
): Dataset => ({
  label,
  data: convertSofarDataToLocalTime(data),
  unit,
  curveColor: color,
  type: "line",
  maxHoursGap: 24,
  tooltipMaxHoursGap: 6,
  displayData: hasAtLeastNData(
    CHART_MIN_NUMBER_OF_POINTS,
    filterSofarData(data, chartStartDate, chartEndDate)
  ),
});
