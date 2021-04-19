/* eslint-disable no-nested-ternary */
import { isNumber } from "lodash";
import type { TableRow } from "../Homepage/types";
import type {
  Metrics,
  MetricsKeys,
  Reef,
  TimeSeriesData,
  TimeSeriesDataRange,
  TimeSeriesDataRangeResponse,
  TimeSeriesDataResponse,
} from "./types";
import { degreeHeatingWeeksCalculator } from "../../helpers/degreeHeatingWeeks";

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
      degreeHeatingDays: latestDhd,
      satelliteTemperature: latestSst,
      weeklyAlertLevel: latestWeeklyAlert,
    } = value.latestDailyData || {};

    const {
      bottomTemperature,
      topTemperature,
      degreeHeatingDays: collectionDhd,
      satelliteTemperature: collectionSst,
      sstAnomaly,
      weeklyAlert: collectionWeeklyAlert,
    } = value?.collectionData || {};

    const dhw = degreeHeatingWeeksCalculator(
      [latestDhd, collectionDhd].find((item) => isNumber(item))
    );
    const { maxMonthlyMean } = value;
    const { name: locationName = "", region = "" } = getReefNameAndRegion(
      value
    );

    return {
      locationName,
      sst: collectionSst || latestSst || null,
      historicMax: maxMonthlyMean,
      sstAnomaly: sstAnomaly || null,
      buoyTop: topTemperature || null,
      buoyBottom: bottomTemperature || null,
      maxMonthlyMean,
      depth: value.depth,
      dhw,
      region,
      tableData: {
        id: key,
      },
      alert: `${latestWeeklyAlert || collectionWeeklyAlert || 0},${longDHW(
        dhw
      )}`,
      alertLevel: latestWeeklyAlert || collectionWeeklyAlert || null,
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
});

export const mapTimeSeriesData = (
  timeSeriesData: TimeSeriesDataResponse
): TimeSeriesData => ({
  hobo: mapMetrics(timeSeriesData.hobo),
  spotter: mapMetrics(timeSeriesData.spotter),
  sofarApi: mapMetrics(timeSeriesData.sofar_api),
});

export const mapTimeSeriesDataRanges = (
  ranges: TimeSeriesDataRangeResponse
): TimeSeriesDataRange => ({
  hobo: mapMetrics(ranges.hobo),
  spotter: mapMetrics(ranges.spotter),
  sofarApi: mapMetrics(ranges.sofar_api),
});
