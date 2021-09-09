import { isNil, mapValues } from "lodash";
import { isBefore } from "../../helpers/dates";
import reefServices from "../../services/reefServices";

import type { TableRow } from "../Homepage/types";
import type {
  DailyData,
  Metrics,
  MetricsKeys,
  OceanSenseData,
  OceanSenseDataResponse,
  OceanSenseKeys,
  Reef,
  SofarValue,
  TimeSeries,
  TimeSeriesData,
  TimeSeriesDataRange,
  TimeSeriesDataRangeResponse,
  TimeSeriesDataRequestParams,
  TimeSeriesDataResponse,
} from "./types";

export function getReefNameAndRegion(reef: Reef) {
  const name = reef.name || reef.region?.name || null;
  const region = reef.name ? reef.region?.name : null;
  return { name, region };
}

export const longDHW = (dhw: number | null): string =>
  `0000${dhw ? Math.round(dhw * 10) : "0"}`.slice(-4);

export const constructTableData = (list: Reef[]): TableRow[] => {
  return list.map((value, key) => {
    const {
      dhw,
      satelliteTemperature,
      weeklyAlert,
      bottomTemperature,
      topTemperature,
      sstAnomaly,
    } = value.collectionData || {};

    const { maxMonthlyMean } = value;
    const { name: locationName = "", region = "" } = getReefNameAndRegion(
      value
    );

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
      alert: `${weeklyAlert || 0},${longDHW(isNil(dhw) ? null : dhw)}`,
      alertLevel: isNil(weeklyAlert) ? null : weeklyAlert,
    };
  });
};

const mapMetrics = <T>(
  data: Record<MetricsKeys, T[]>
): Record<Metrics, T[]> => ({
  alert: data.alert,
  bottomTemperature: data.bottom_temperature,
  dhw: data.dhw,
  satelliteTemperature: data.satellite_temperature,
  sstAnomaly: data.sst_anomaly,
  topTemperature: data.top_temperature,
  significantWaveHeight: data.significant_wave_height,
  waveMeanDirection: data.wave_mean_direction,
  wavePeakPeriod: data.wave_peak_period,
  windDirection: data.wind_direction,
  windSpeed: data.wind_speed,
  weeklyAlert: data.weekly_alert,
});

export const mapTimeSeriesData = (
  timeSeriesData: TimeSeriesDataResponse
): TimeSeriesData => ({
  hobo: mapMetrics(timeSeriesData.hobo),
  spotter: mapMetrics(timeSeriesData.spotter),
  sofarNoaa: mapMetrics(timeSeriesData.noaa),
  sofarGfs: mapMetrics(timeSeriesData.gfs),
});

export const mapTimeSeriesDataRanges = (
  ranges: TimeSeriesDataRangeResponse
): TimeSeriesDataRange => ({
  hobo: mapMetrics(ranges.hobo),
  spotter: mapMetrics(ranges.spotter),
  sofarNoaa: mapMetrics(ranges.noaa),
  sofarGfs: mapMetrics(ranges.gfs),
});

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
): OceanSenseData => {
  return {
    DO: mapOceanSenseMetric(response, "DO"),
    EC: mapOceanSenseMetric(response, "EC"),
    ORP: mapOceanSenseMetric(response, "ORP"),
    PH: mapOceanSenseMetric(response, "PH"),
    PRESS: mapOceanSenseMetric(response, "PRESS"),
  };
};

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
): TimeSeriesData =>
  mapValues(previousData, (previousSensorData, sensor) =>
    mapValues(previousSensorData, (previousMetricData, metric) =>
      attachData(
        direction,
        newData[sensor as keyof TimeSeriesData][metric as keyof TimeSeries],
        previousMetricData
      )
    )
  );

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
    updatedStoredStart: string,
    updatedStoredEnd: string
  ]
> => {
  const { start, end } = params;
  const minDate =
    storedStart && !isBefore(start, storedStart, true) ? storedStart : start;
  const maxDate = storedEnd && isBefore(end, storedEnd, true) ? storedEnd : end;

  // If the user requests data for < storedStart, then make a request for the interval
  // [start, storedStart] and attach the resulting data to the already existing data.
  if (
    storedDailyData &&
    storedTimeSeries &&
    storedStart &&
    isBefore(start, storedStart, true)
  ) {
    const { data } = await reefServices.getReefTimeSeriesData({
      ...params,
      start,
      end: storedStart,
    });
    const { data: granularDailyData } = await reefServices.getReefDailyData(
      params.reefId,
      start,
      storedStart
    );

    return [
      attachTimeSeries("left", mapTimeSeriesData(data), storedTimeSeries),
      attachData("left", granularDailyData, storedDailyData),
      minDate,
      maxDate,
    ];
  }

  // If the user requests data for > storedEnd, then make a request for the interval
  // [storedEnd, end] and attach the resulting data to the already existing data.
  if (
    storedDailyData &&
    storedTimeSeries &&
    storedEnd &&
    isBefore(storedEnd, end, true)
  ) {
    const { data } = await reefServices.getReefTimeSeriesData({
      ...params,
      start: storedEnd,
      end,
    });
    const { data: granularDailyData } = await reefServices.getReefDailyData(
      params.reefId,
      storedEnd,
      end
    );

    return [
      attachTimeSeries("right", mapTimeSeriesData(data), storedTimeSeries),
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
    isBefore(storedStart, start) &&
    isBefore(end, storedEnd)
  ) {
    return [storedTimeSeries, storedDailyData, minDate, maxDate];
  }

  // In any other case, make a request for the interval [start, end].
  const { data } = await reefServices.getReefTimeSeriesData(params);
  const { data: granularDailyData } = await reefServices.getReefDailyData(
    params.reefId,
    params.start,
    params.end
  );

  return [mapTimeSeriesData(data), granularDailyData, minDate, maxDate];
};
