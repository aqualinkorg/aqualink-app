/* eslint-disable no-nested-ternary */
import type { TableRow } from "../Homepage/types";
import type {
  HoboData,
  HoboDataRange,
  HoboDataRangeResponse,
  HoboDataResponse,
  Reef,
} from "./types";
import { Metrics } from "./types";
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
      value.latestDailyData || {};
    const dhw = degreeHeatingWeeksCalculator(degreeHeatingDays);
    const { maxMonthlyMean } = value;
    const { name: locationName = "", region = "" } = getReefNameAndRegion(
      value
    );

    return {
      locationName,
      temp: satelliteTemperature,
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

export const mapHoboData = (hoboData: HoboDataResponse): HoboData => ({
  alert: hoboData[Metrics.alert],
  bottomTemperature: hoboData[Metrics.bottomTemperature],
  dhw: hoboData[Metrics.dhw],
  satelliteTemperature: hoboData[Metrics.satelliteTemperature],
  sstAnomaly: hoboData[Metrics.sstAnomaly],
  surfaceTemperature: hoboData[Metrics.surfaceTemperature],
});

export const mapHoboDataRanges = (
  ranges: HoboDataRangeResponse
): HoboDataRange => ({
  alert: ranges[Metrics.alert],
  bottomTemperature: ranges[Metrics.bottomTemperature],
  dhw: ranges[Metrics.dhw],
  satelliteTemperature: ranges[Metrics.satelliteTemperature],
  sstAnomaly: ranges[Metrics.sstAnomaly],
  surfaceTemperature: ranges[Metrics.surfaceTemperature],
});
