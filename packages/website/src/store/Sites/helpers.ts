import {
  isNil,
  mapValues,
  mapKeys,
  camelCase,
  map,
  keyBy,
  pick,
  union,
  isString,
} from "lodash";
import { isBefore } from "../../helpers/dates";
import { longDHW } from "../../helpers/siteUtils";
import siteServices from "../../services/siteServices";

import type { TableRow } from "../Homepage/types";
import {
  DailyData,
  LatestData,
  LatestDataASSofarValue,
  Metrics,
  MetricsKeys,
  metricsKeysList,
  OceanSenseData,
  OceanSenseDataResponse,
  OceanSenseKeys,
  OceanSenseKeysList,
  Site,
  SofarValue,
  Sources,
  TimeSeriesData,
  TimeSeriesDataRange,
  TimeSeriesDataRangeResponse,
  TimeSeriesDataRequestParams,
  TimeSeriesDataResponse,
} from "./types";

export function getSiteNameAndRegion(site: Site) {
  const name = site.name || site.region?.name || null;
  const region = site.name ? site.region?.name : null;
  return { name, region };
}

export const constructTableData = (list: Site[]): TableRow[] => {
  return list.map((value, key) => {
    const {
      dhw,
      satelliteTemperature,
      tempWeeklyAlert,
      bottomTemperature,
      topTemperature,
      sstAnomaly,
    } = value.collectionData || {};

    const { maxMonthlyMean } = value;
    const { name: locationName = "", region = "" } =
      getSiteNameAndRegion(value);

    return {
      locationName,
      sst: isNil(satelliteTemperature) ? null : satelliteTemperature,
      historicMax: maxMonthlyMean,
      sstAnomaly: isNil(sstAnomaly) ? null : sstAnomaly,
      buoyTop: isNil(topTemperature) ? null : topTemperature,
      buoyBottom: isNil(bottomTemperature) ? null : bottomTemperature,
      maxMonthlyMean,
      depth: value.depth,
      dhw: isNil(dhw) ? null : dhw,
      region,
      tableData: {
        id: key,
      },
      alert: `${tempWeeklyAlert || 0},${longDHW(isNil(dhw) ? null : dhw)}`,
      alertLevel: isNil(tempWeeklyAlert) ? null : tempWeeklyAlert,
    };
  });
};

const mapMetrics = <T>(
  data: Partial<Record<MetricsKeys, T>>
): Partial<Record<Metrics, T>> =>
  mapKeys(pick(data, metricsKeysList), (_, key) => camelCase(key)) as Partial<
    Record<Metrics, T>
  >;

export const mapTimeSeriesData = (
  timeSeriesData: TimeSeriesDataResponse
): TimeSeriesData => mapMetrics(timeSeriesData);

export const mapTimeSeriesDataRanges = (
  ranges: TimeSeriesDataRangeResponse
): TimeSeriesDataRange => mapMetrics(ranges);

const mapOceanSenseMetric = (
  response: OceanSenseDataResponse,
  key: OceanSenseKeys
): SofarValue[] =>
  response.data[key].map((value, index) => ({
    value,
    timestamp: response.timestamps[index],
  }));

export const mapOceanSenseData = (
  response: OceanSenseDataResponse
): OceanSenseData =>
  mapValues(
    keyBy(
      map(OceanSenseKeysList, (oceanSenseKey) => ({
        key: oceanSenseKey,
        value: mapOceanSenseMetric(response, oceanSenseKey),
      })),
      "key"
    ),
    "value"
  ) as OceanSenseData;

const attachData = <T>(
  direction: "left" | "right",
  newData: T[],
  previousData?: T[]
) =>
  direction === "left"
    ? [...newData, ...(previousData || [])]
    : [...(previousData || []), ...newData];

const attachTimeSeries = (
  direction: "left" | "right",
  newData: TimeSeriesData,
  previousData?: TimeSeriesData
): TimeSeriesData => {
  const previousMetrics = Object.keys(previousData || {});
  const newMetrics = Object.keys(newData);
  const metrics = union(previousMetrics, newMetrics) as Metrics[];

  return metrics.reduce((ret, currMetric) => {
    const previousMetricData = previousData?.[currMetric] || {};
    const newMetricData = newData?.[currMetric] || {};
    const previousMetricSources = Object.keys(previousMetricData);
    const newMetricSources = Object.keys(newMetricData);
    const sources = union(previousMetricSources, newMetricSources) as Sources[];

    return {
      ...ret,
      [currMetric]: sources.reduce(
        (acc, source) => ({
          ...acc,
          [source]: {
            surveyPoint: (newMetricData || previousMetricData)?.[source]
              ?.surveyPoint,
            data: attachData(
              direction,
              newMetricData?.[source]?.data || [],
              previousMetricData?.[source]?.data || []
            ),
          },
        }),
        {}
      ),
    };
  }, {});
};

const findRequestTimePeriod = (
  prevStart?: string,
  prevEnd?: string,
  newStart?: string,
  newEnd?: string
): "past" | "future" | "between" | undefined => {
  if (
    prevEnd === newEnd &&
    isString(prevStart) &&
    isString(newStart) &&
    isBefore(newStart, prevStart, true)
  ) {
    return "past";
  }

  if (
    prevStart === newStart &&
    isString(prevEnd) &&
    isString(newEnd) &&
    isBefore(prevEnd, newEnd, true)
  ) {
    return "future";
  }

  if (
    isString(newStart) &&
    isString(newEnd) &&
    isString(prevStart) &&
    isString(prevEnd) &&
    isBefore(prevStart, newStart) &&
    isBefore(newEnd, prevEnd)
  ) {
    return "between";
  }

  return undefined;
};

const calculateRequestParams = (
  prevStart?: string,
  prevEnd?: string,
  newStart?: string,
  newEnd?: string
): {
  start?: string;
  end?: string;
  attachDirection?: "right" | "left";
  returnStored?: boolean;
} => {
  const timePeriod = findRequestTimePeriod(
    prevStart,
    prevEnd,
    newStart,
    newEnd
  );

  switch (timePeriod) {
    case "past":
      return {
        start: newStart,
        end: prevStart,
        attachDirection: "left",
      };

    case "future":
      return {
        start: prevEnd,
        end: newEnd,
        attachDirection: "right",
      };

    case "between":
      return { returnStored: true };

    default:
      return { start: newStart, end: newEnd };
  }
};

/**
  Util function that is responsible for fetching the time series and daily data.
  This function takes into consideration that only one from `params.start` and `params.end`
  can change at a time, so there is always going to be an overlap between the intervals
  `[params.start, params.end]` and `[storedStart, storedEnd]`.

  @param params - The time series request params
  @param storedTimeSeries - The already existing time series data
  @param storedDailyData - The already existing daily data
  @param storedStart - The earliest date the user has requested data for
  @param storedEnd - The most recent date the user has requested data for
*/
export const timeSeriesRequest = async (
  inputParams: TimeSeriesDataRequestParams,
  storedTimeSeries?: TimeSeriesData,
  storedDailyData?: DailyData[],
  storedStart?: string,
  storedEnd?: string
): Promise<
  [
    updatedTimeSeriesData?: TimeSeriesData,
    updatedDailyData?: DailyData[],
    updatedStoredStart?: string,
    updatedStoredEnd?: string
  ]
> => {
  const { siteId, start: inputStart, end: inputEnd } = inputParams;
  const minDate =
    storedStart && inputStart && !isBefore(inputStart, storedStart, true)
      ? storedStart
      : inputStart;
  const maxDate =
    storedEnd && inputEnd && isBefore(inputEnd, storedEnd, true)
      ? storedEnd
      : inputEnd;
  const { start, end, attachDirection, returnStored } = calculateRequestParams(
    storedStart,
    storedEnd,
    inputStart,
    inputEnd
  );

  if (returnStored) {
    return [storedTimeSeries, storedDailyData, storedStart, storedEnd];
  }

  const timeSeriesData =
    start && end
      ? (
          await siteServices.getSiteTimeSeriesData({
            ...inputParams,
            start,
            end,
          })
        )?.data
      : {};

  const granularDailyData =
    start && end
      ? (await siteServices.getSiteDailyData(siteId, start, end))?.data
      : [];

  const resultingTimeSeriesData = attachDirection
    ? attachTimeSeries(
        attachDirection,
        mapTimeSeriesData(timeSeriesData),
        storedTimeSeries
      )
    : mapTimeSeriesData(timeSeriesData);

  const resultingDailyData = attachDirection
    ? attachData(attachDirection, granularDailyData, storedDailyData)
    : granularDailyData;

  return [
    resultingTimeSeriesData,
    resultingDailyData,
    !attachDirection ? start : minDate,
    !attachDirection ? end : maxDate,
  ];
};

export const parseLatestData = (data: LatestData[]): LatestDataASSofarValue => {
  if (!data || data.length === 0) return {};

  // Coping, sorting and filtering are done to keep the latest timestamp for each Metric
  const copy = [...data];

  const spotterValidityLimit = 12 * 60 * 60 * 1000; // 12 hours
  const validityDate = Date.now() - spotterValidityLimit;

  // eslint-disable-next-line fp/no-mutating-methods
  const sorted = copy.sort((x, y) => {
    // if spotter data is available and less than 12 hours old, use it.
    const xTime = new Date(x.timestamp).getTime();
    if (x.source === "spotter" && xTime > validityDate) {
      return -1;
    }
    const yTime = new Date(y.timestamp).getTime();
    if (y.source === "spotter" && yTime > validityDate) {
      return -1;
    }

    if (xTime > yTime) return -1;
    if (xTime < yTime) return 1;
    return 0;
  });

  const filtered = sorted.filter(
    (value, index, self) => self.indexOf(value) === index
  );

  return filtered.reduce(
    (a, c) => ({
      ...a,
      [camelCase(c.metric)]: { timestamp: c.timestamp, value: c.value },
    }),
    {}
  );
};
