import { isNil, isNumber, inRange } from "lodash";
import noStress from "../assets/alerts/alert_nostress.svg";
import warning from "../assets/alerts/alert_warning.svg";
import watch from "../assets/alerts/alert_watch.svg";
import lvl1 from "../assets/alerts/alert_lvl1.svg";
import lvl2 from "../assets/alerts/alert_lvl2.svg";
import pinNoStress from "../assets/alerts/pin_nostress@2x.png";
import pinWatch from "../assets/alerts/pin_watch@2x.png";
import pinWarning from "../assets/alerts/pin_warning@2x.png";
import pinLvl1 from "../assets/alerts/pin_lvl1@2x.png";
import pinLvl2 from "../assets/alerts/pin_lvl2@2x.png";

type Interval = {
  image: string;
  color: string;
  icon: string;
  level: number;
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
    case isNil(hotSpot):
    case isNumber(hotSpot) && hotSpot <= 0:
      return {
        image: noStress,
        color: "#C6E5FA",
        icon: pinNoStress,
        level: 0,
      };

    case isNumber(hotSpot) && hotSpot < 1:
      return {
        image: watch,
        color: "#FFF200",
        icon: pinWatch,
        level: 1,
      };

    // Hotspot >=1 or nil past this point, start dhw checks.
    case isNil(degreeHeatingWeeks):
      return {
        image: noStress,
        color: "#C6E5FA",
        icon: pinNoStress,
        level: 0,
      };

    case inRange(degreeHeatingWeeks!, 0, 4):
      return {
        image: warning,
        color: "#F8AB00",
        icon: pinWarning,
        level: 2,
      };

    case inRange(degreeHeatingWeeks!, 4, 8):
      return {
        image: lvl1,
        color: "#EF0000",
        icon: pinLvl1,
        level: 3,
      };

    case degreeHeatingWeeks! >= 8:
      return {
        image: lvl2,
        color: "#940000",
        icon: pinLvl2,
        level: 4,
      };

    default:
      return {
        image: noStress,
        color: "#C6E5FA",
        icon: pinNoStress,
        level: 0,
      };
  }
};

export const alertFinder = (
  maxMonthlyMean: number | null,
  satelliteTemperature: number | null,
  degreeHeatingWeeks?: number | null
): Interval => {
  return findInterval(maxMonthlyMean, satelliteTemperature, degreeHeatingWeeks);
};

export const alertIconFinder = (
  maxMonthlyMean: number | null,
  satelliteTemperature: number | null,
  degreeHeatingWeeks?: number | null
): string => {
  return findInterval(maxMonthlyMean, satelliteTemperature, degreeHeatingWeeks)
    .icon;
};

export const alertColorFinder = (
  maxMonthlyMean: number | null,
  satelliteTemperature: number | null,
  degreeHeatingWeeks?: number | null
): string => {
  return findInterval(maxMonthlyMean, satelliteTemperature, degreeHeatingWeeks)
    .color;
};

export default { alertFinder, alertColorFinder, alertIconFinder };
