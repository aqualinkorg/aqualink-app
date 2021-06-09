import type { TableRow } from "../Homepage/types";
import type {
  Metrics,
  MetricsKeys,
  OceanSenseData,
  OceanSenseDataResponse,
  OceanSenseKeys,
  Reef,
  SofarValue,
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
    const { degreeHeatingDays, satelliteTemperature, weeklyAlertLevel } =
      value.latestDailyData || value.collectionData || {};

    const { bottomTemperature, topTemperature, sstAnomaly } =
      value.collectionData || {};

    const dhw = degreeHeatingWeeksCalculator(degreeHeatingDays);
    const { maxMonthlyMean } = value;
    const { name: locationName = "", region = "" } = getReefNameAndRegion(
      value
    );

    return {
      locationName,
      sst: satelliteTemperature || null,
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
      alert: `${weeklyAlertLevel || 0},${longDHW(dhw)}`,
      alertLevel: weeklyAlertLevel || null,
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
    TEMP: mapOceanSenseMetric(response, "TEMP"),
    DO: mapOceanSenseMetric(response, "DO"),
    EC: mapOceanSenseMetric(response, "EC"),
    ORP: mapOceanSenseMetric(response, "ORP"),
    PH: mapOceanSenseMetric(response, "PH"),
    PRESS: mapOceanSenseMetric(response, "PRESS"),
  };
};
