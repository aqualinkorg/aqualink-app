import { isNil, isNumber, inRange } from "lodash";
import noStress from "../assets/alert_nostress.svg";
import warning from "../assets/alert_warning.svg";
import watch from "../assets/alert_watch.svg";
import lvl1 from "../assets/alert_lvl1.svg";
import lvl2 from "../assets/alert_lvl2.svg";

type Interval = {
  image: string;
  color: string;
};

/**
 * Calculating bleaching alert level based on NOAA defintions:
 * available at https://coralreefwatch.noaa.gov/subscriptions/vs.php
 * @param temperatureThreshold
 * @param satelliteTemperature
 * @param degreeHeatingWeeks
 */
const findInterval = (
  maxMonthlyMean: number | null,
  satelliteTemperature: number | null,
  degreeHeatingWeeks?: number | null
): Interval => {
  const hotSpot =
    satelliteTemperature &&
    maxMonthlyMean &&
    satelliteTemperature - maxMonthlyMean;

  switch (true) {
    case isNumber(hotSpot) && hotSpot <= 0:
      return {
        image: noStress,
        color: "#C6E5FA",
      };

    case isNumber(hotSpot) && hotSpot < 1:
      return {
        image: watch,
        color: "#FFF200",
      };

    // Hotspot >=1 or nil past this point, start dhw checks.
    case isNil(degreeHeatingWeeks):
      return {
        image: noStress,
        color: "#C6E5FA",
      };

    case inRange(degreeHeatingWeeks!, 0, 4):
      return {
        image: warning,
        color: "#F8AB00",
      };

    case inRange(degreeHeatingWeeks!, 4, 8):
      return {
        image: lvl1,
        color: "#EF0000",
      };

    case degreeHeatingWeeks! >= 8:
      return {
        image: lvl2,
        color: "#940000",
      };

    default:
      return {
        image: noStress,
        color: "#C6E5FA",
      };
  }
};

export const alertFinder = (
  maxMonthlyMean: number | null,
  satelliteTemperature: number | null,
  degreeHeatingWeeks?: number | null
): string => {
  return findInterval(maxMonthlyMean, satelliteTemperature, degreeHeatingWeeks)
    .image;
};

export const alertColorFinder = (
  maxMonthlyMean: number | null,
  satelliteTemperature: number | null,
  degreeHeatingWeeks?: number | null
): string => {
  return findInterval(maxMonthlyMean, satelliteTemperature, degreeHeatingWeeks)
    .color;
};

export default { alertFinder, alertColorFinder };
