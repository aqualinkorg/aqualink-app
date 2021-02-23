/* eslint-disable no-nested-ternary */
import type { TableRow } from "../Homepage/types";
import type { HoboData, HoboDataResponse, Reef } from "./types";
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

export const mapHoboData = (hoboData: HoboDataResponse): HoboData => {
  return {
    alert:
      hoboData[Metrics.alert]?.map(({ value, timestamp }) => ({
        value,
        timestamp,
      })) || [],
    bottomTemperature:
      hoboData[Metrics.bottomTemperature]?.map(({ value, timestamp }) => ({
        value,
        timestamp,
      })) || [],
    dhw:
      hoboData[Metrics.dhw]?.map(({ value, timestamp }) => ({
        value,
        timestamp,
      })) || [],
    satelliteTemperature:
      hoboData[Metrics.satelliteTemperature]?.map(({ value, timestamp }) => ({
        value,
        timestamp,
      })) || [],
    sstAnomaly:
      hoboData[Metrics.sstAnomaly]?.map(({ value, timestamp }) => ({
        value,
        timestamp,
      })) || [],
    surfaceTemperature:
      hoboData[Metrics.surfaceTemperature]?.map(({ value, timestamp }) => ({
        value,
        timestamp,
      })) || [],
  };
};
