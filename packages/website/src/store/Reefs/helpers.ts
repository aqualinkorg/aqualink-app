/* eslint-disable no-nested-ternary */
import type { TableRow } from "../Homepage/types";
import type { Reef } from "./types";
import { degreeHeatingWeeksCalculator } from "../../helpers/degreeHeatingWeeks";

export const constructTableData = (list: Reef[]): TableRow[] => {
  return list.map((value, key) => {
    const { degreeHeatingDays, satelliteTemperature, maxBottomTemperature } =
      value.latestDailyData || {};
    const dhw = degreeHeatingWeeksCalculator(degreeHeatingDays);
    const { maxMonthlyMean, name, region } = value;
    const locationName = name || region?.name || null;

    return {
      locationName,
      temp: maxBottomTemperature || satelliteTemperature,
      maxMonthlyMean,
      depth: value.depth,
      dhw,
      tableData: {
        id: key,
      },
      alert: dhw,
    };
  });
};
