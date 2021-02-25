import { min, max, mean, minBy, maxBy, meanBy } from "lodash";

import {
  DailyData,
  SofarValue,
  SpotterData,
} from "../../../../store/Reefs/types";
import { formatNumber } from "../../../../helpers/numberUtils";

export const calculateCardMetrics = (
  dailyData: DailyData[],
  spotterData: SpotterData | null | undefined,
  hoboBottomTemperature: SofarValue[]
) => {
  const satelliteSurface = dailyData.map((item) => item.satelliteTemperature);
  const { bottomTemperature: spotterBottomTemperature } = spotterData || {};
  const hasHoboData = hoboBottomTemperature.length > 0;

  const display =
    hasHoboData ||
    (spotterBottomTemperature && spotterBottomTemperature?.length > 0);

  const bottomTemperature = hasHoboData
    ? hoboBottomTemperature
    : spotterBottomTemperature;

  const minSurface = display ? formatNumber(min(satelliteSurface), 1) : "--";
  const maxSurface = display ? formatNumber(max(satelliteSurface), 1) : "--";
  const meanSurface = display ? formatNumber(mean(satelliteSurface), 1) : "--";

  const minBottom = bottomTemperature
    ? formatNumber(minBy(bottomTemperature, (item) => item.value)?.value, 1)
    : "--";
  const maxBottom = bottomTemperature
    ? formatNumber(maxBy(bottomTemperature, (item) => item.value)?.value, 1)
    : "--";
  const meanBottom = bottomTemperature
    ? formatNumber(
        meanBy(bottomTemperature, (item) => item.value),
        1
      )
    : "--";

  return {
    minSurface,
    maxSurface,
    meanSurface,
    minBottom,
    maxBottom,
    meanBottom,
  };
};
