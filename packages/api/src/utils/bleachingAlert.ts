import { isNil, isNumber, inRange } from 'lodash';

/**
 * Calculating bleaching alert level based on NOAA defintions:
 * available at https://coralreefwatch.noaa.gov/subscriptions/vs.php
 * @param temperatureThreshold
 * @param satelliteTemperature
 * @param degreeHeatingWeeks
 */
export const calculateAlertLevel = (
  maxMonthlyMean: number | null,
  satelliteTemperature?: number | null,
  degreeHeatingWeeks?: number | null,
): number | undefined => {
  const hotSpot =
    satelliteTemperature &&
    maxMonthlyMean &&
    satelliteTemperature - maxMonthlyMean;

  switch (true) {
    case isNil(hotSpot):
      return undefined;

    case isNumber(hotSpot) && hotSpot <= 0:
      return 0;

    case isNumber(hotSpot) && hotSpot < 1:
      return 1;

    // Hotspot >=1 or nil past this point, start dhw checks.
    case isNil(degreeHeatingWeeks):
      return 0;

    case inRange(degreeHeatingWeeks!, 0, 4):
      return 2;

    case inRange(degreeHeatingWeeks!, 4, 8):
      return 3;

    case degreeHeatingWeeks! >= 8:
      return 4;

    default:
      return undefined;
  }
};
