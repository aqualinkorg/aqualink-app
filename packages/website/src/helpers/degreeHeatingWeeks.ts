import { isNil, isNumber } from "lodash";
import { colorCode } from "../assets/colorCode";

export const degreeHeatingWeeksCalculator = (degreeHeatingDays?: number) =>
  isNumber(degreeHeatingDays) ? degreeHeatingDays / 7 : null;

export const colorFinder = (degreeHeatingWeeks?: number | null): string => {
  const len = colorCode.length;

  if (isNil(degreeHeatingWeeks) || degreeHeatingWeeks < colorCode[0].value) {
    return colorCode[0].color;
  }
  if (degreeHeatingWeeks > colorCode[len - 1].value) {
    return colorCode[len - 1].color;
  }
  const index = colorCode.findIndex((item) => degreeHeatingWeeks < item.value);
  return colorCode[index - 1].color;
};
