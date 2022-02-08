import {
  isNil,
  mapValues,
  mapKeys,
  camelCase,
  map,
  keyBy,
  pick,
  union,
} from "lodash";
import { isBefore } from "../../helpers/dates";
import { longDHW } from "../../helpers/siteUtils";
import siteServices from "../../services/siteServices";

import type { TableRow } from "../Homepage/types";
import {
  DailyData,
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
  data: Partial<Record<MetricsKeys, T[]>>
): Partial<Record<Metrics, T[]>> =>
  mapKeys(pick(data, metricsKeysList), (_, key) => camelCase(key)) as Partial<
    Record<Metrics, T[]>
  >;

export const mapTimeSeriesData = (
  timeSeriesData: TimeSeriesDataResponse
): TimeSeriesData => mapValues(timeSeriesData, mapMetrics);

export const mapTimeSeriesDataRanges = (
  ranges: TimeSeriesDataRangeResponse
): TimeSeriesDataRange => mapValues(ranges, mapMetrics);

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
  previousData: T[]
) =>
  direction === "left"
    ? [...newData, ...previousData]
    : [...previousData, ...newData];

const attachTimeSeries = (
  direction: "left" | "right",
  newData: TimeSeriesData,
  previousData: TimeSeriesData
): TimeSeriesData => {
  const previousSources = Object.keys(previousData);
  const newSources = Object.keys(newData);
  const sources = union(previousSources, newSources) as Sources[];

  return sources.reduce((ret, currSource) => {
    const previousSensorData = previousData?.[currSource] || {};
    const newSensorData = newData?.[currSource] || {};
    const previousSensorMetrics = Object.keys(previousSensorData);
    const newSensorMetrics = Object.keys(newSensorData);
    const metrics = union(previousSensorMetrics, newSensorMetrics) as Metrics[];

    return {
      ...ret,
      [currSource]: metrics.reduce(
        (acc, metric) => ({
          ...acc,
          [metric]: attachData(
            direction,
            newSensorData?.[metric] || [],
            previousSensorData?.[metric] || []
          ),
        }),
        {}
      ),
    };
  }, {});
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
  params: TimeSeriesDataRequestParams,
  storedTimeSeries?: TimeSeriesData,
  storedDailyData?: DailyData[],
  storedStart?: string,
  storedEnd?: string
): Promise<
  [
    updatedTimeSeriesData: TimeSeriesData,
    updatedDailyData: DailyData[],
    updatedStoredStart?: string,
    updatedStoredEnd?: string
  ]
> => {
  const { siteId, start, end } = params;
  const minDate =
    storedStart && start && !isBefore(start, storedStart, true)
      ? storedStart
      : start;
  const maxDate =
    storedEnd && end && isBefore(end, storedEnd, true) ? storedEnd : end;

  // If the user requests data for < storedStart, then make a request for the interval
  // [start, storedStart] and attach the resulting data to the already existing data.
  if (
    // make sure the end date did not change
    end === storedEnd &&
    storedDailyData &&
    storedTimeSeries &&
    storedStart &&
    start &&
    isBefore(start, storedStart, true)
  ) {
    const { data: timeSeriesData } = await siteServices.getSiteTimeSeriesData({
      ...params,
      start,
      end: storedStart,
    });
    const { data: granularDailyData } = await siteServices.getSiteDailyData(
      siteId,
      start,
      storedStart
    );

    return [
      attachTimeSeries(
        "left",
        mapTimeSeriesData(timeSeriesData),
        storedTimeSeries
      ),
      attachData("left", granularDailyData, storedDailyData),
      minDate,
      maxDate,
    ];
  }

  // If the user requests data for > storedEnd, then make a request for the interval
  // [storedEnd, end] and attach the resulting data to the already existing data.
  if (
    // make sure the start date did not change
    start === storedStart &&
    storedDailyData &&
    storedTimeSeries &&
    storedEnd &&
    end &&
    isBefore(storedEnd, end, true)
  ) {
    const { data: timeSeriesData } = await siteServices.getSiteTimeSeriesData({
      ...params,
      start: storedEnd,
      end,
    });
    const { data: granularDailyData } = await siteServices.getSiteDailyData(
      siteId,
      storedEnd,
      end
    );

    return [
      attachTimeSeries(
        "right",
        mapTimeSeriesData(timeSeriesData),
        storedTimeSeries
      ),
      attachData("right", granularDailyData, storedDailyData),
      minDate,
      maxDate,
    ];
  }

  // If the interval [start, end] belongs to the interval [storedStart, storedEnd],
  // return the already existing data.
  if (
    storedDailyData &&
    storedTimeSeries &&
    storedStart &&
    storedEnd &&
    start &&
    end &&
    isBefore(storedStart, start) &&
    isBefore(end, storedEnd)
  ) {
    return [storedTimeSeries, storedDailyData, minDate, maxDate];
  }

  // In any other case, make a request for the interval [start, end].
  const { data: timeSeriesData } = await siteServices.getSiteTimeSeriesData(
    params
  );
  const { data: granularDailyData } = await siteServices.getSiteDailyData(
    siteId,
    start,
    end
  );

  return [
    mapTimeSeriesData(timeSeriesData),
    granularDailyData,
    minDate,
    maxDate,
  ];
};
