import { minBy, maxBy, meanBy } from "lodash";

import { SpotterData } from "../../../../store/Reefs/types";
import { formatNumber } from "../../../../helpers/numberUtils";

export const calculateCardMetrics = (
  spotterData: SpotterData | null | undefined
) => {
  const { surfaceTemperature, bottomTemperature } = spotterData || {};

  const minSurface =
    surfaceTemperature &&
    formatNumber(minBy(surfaceTemperature, (item) => item.value)?.value, 1);
  const maxSurface =
    surfaceTemperature &&
    formatNumber(maxBy(surfaceTemperature, (item) => item.value)?.value, 1);
  const meanSurface =
    surfaceTemperature &&
    formatNumber(
      meanBy(surfaceTemperature, (item) => item.value),
      1
    );

  const minBottom =
    bottomTemperature &&
    formatNumber(minBy(bottomTemperature, (item) => item.value)?.value, 1);
  const maxBottom =
    bottomTemperature &&
    formatNumber(maxBy(bottomTemperature, (item) => item.value)?.value, 1);
  const meanBottom =
    bottomTemperature &&
    formatNumber(
      meanBy(bottomTemperature, (item) => item.value),
      1
    );

  return {
    minSurface,
    maxSurface,
    meanSurface,
    minBottom,
    maxBottom,
    meanBottom,
  };
};
