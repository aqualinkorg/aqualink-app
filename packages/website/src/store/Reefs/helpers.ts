/* eslint-disable no-nested-ternary */
import type { TableRow } from "../Homepage/types";
import type { Reef } from "./types";
import { degreeHeatingWeeksCalculator } from "../../helpers/degreeHeatingWeeks";

export const constructTableData = (list: Reef[]): TableRow[] => {
  return list.map((value, key) => {
    const { degreeHeatingDays, satelliteTemperature, maxBottomTemperature } =
      value.latestDailyData || {};
    const locationName = value.name || value.region?.name || null;
    return {
      locationName,
      temp: maxBottomTemperature || satelliteTemperature,
      depth: value.depth,
      dhw: degreeHeatingWeeksCalculator(degreeHeatingDays),
      tableData: {
        id: key,
      },
    };
  });
};
