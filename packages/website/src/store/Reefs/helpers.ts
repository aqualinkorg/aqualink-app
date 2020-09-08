/* eslint-disable no-nested-ternary */
import type { TableRow } from "../Homepage/types";
import type { Reef } from "./types";
import { degreeHeatingWeeksCalculator } from "../../helpers/degreeHeatingWeeks";
import { formatNumber } from "../../helpers/numberUtils";

export const constructTableData = (list: Reef[]): TableRow[] => {
  return list.map((value, key) => {
    const { degreeHeatingDays, satelliteTemperature } =
      value.latestDailyData || {};
    const locationName = value.name || value.region?.name || null;
    return {
      locationName,
      temp: formatNumber(satelliteTemperature, 1),
      depth: value.depth,
      dhw: degreeHeatingWeeksCalculator(degreeHeatingDays),
      tableData: {
        id: key,
      },
    };
  });
};
