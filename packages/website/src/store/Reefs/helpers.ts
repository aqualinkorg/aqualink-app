/* eslint-disable no-nested-ternary */
import type { TableRow } from "../Homepage/types";
import type { Reef } from "./types";
import { degreeHeatingWeeksCalculator } from "../../helpers/degreeHeatingWeeks";
import { alertFinder } from "../../helpers/bleachingAlertIntervals";

export const formatReefName = (reef: Reef) =>
  reef.name || reef.region?.name || null;

const longDHW = (dhw: number | null): string =>
  `0000${dhw ? Math.round(dhw * 10) : "0"}`.slice(-4);

export const constructTableData = (list: Reef[]): TableRow[] => {
  return list.map((value, key) => {
    const { degreeHeatingDays, satelliteTemperature, maxBottomTemperature } =
      value.latestDailyData || {};
    const dhw = degreeHeatingWeeksCalculator(degreeHeatingDays);
    const { maxMonthlyMean } = value;
    const locationName = formatReefName(value);

    return {
      locationName,
      temp: maxBottomTemperature || satelliteTemperature,
      maxMonthlyMean,
      depth: value.depth,
      dhw,
      tableData: {
        id: key,
      },
      alert: `${
        alertFinder(maxMonthlyMean, satelliteTemperature, dhw).level
      },${longDHW(dhw)}`,
    };
  });
};
