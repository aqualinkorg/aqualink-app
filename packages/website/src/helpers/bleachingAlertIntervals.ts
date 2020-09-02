import { isNil } from "lodash";

import noStress from "../assets/alert_nostress.svg";
import warning from "../assets/alert_warning.svg";
import watch from "../assets/alert_watch.svg";
import lvl1 from "../assets/alert_lvl1.svg";
import lvl2 from "../assets/alert_lvl2.svg";

const bleachingAlertIntervals = [
  {
    min: 0,
    image: noStress,
  },
  {
    min: 5,
    image: warning,
  },
  {
    min: 10,
    image: watch,
  },
  {
    min: 15,
    image: lvl1,
  },
  {
    min: 20,
    image: lvl2,
  },
];

export const alertFinder = (degreeHeatingWeeks?: number | null): string => {
  const len = bleachingAlertIntervals.length;

  if (
    isNil(degreeHeatingWeeks) ||
    degreeHeatingWeeks < bleachingAlertIntervals[0].min
  ) {
    return bleachingAlertIntervals[0].image;
  }
  if (degreeHeatingWeeks > bleachingAlertIntervals[len - 1].min) {
    return bleachingAlertIntervals[len - 1].image;
  }
  const index = bleachingAlertIntervals.findIndex(
    (item) => degreeHeatingWeeks < item.min
  );
  return bleachingAlertIntervals[index - 1].image;
};

export default { alertFinder };
