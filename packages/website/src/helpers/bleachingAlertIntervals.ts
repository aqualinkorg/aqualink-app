import noStress from "../assets/alert_nostress.svg";
import warning from "../assets/alert_warning.svg";
import watch from "../assets/alert_watch.svg";
import lvl1 from "../assets/alert_lvl1.svg";
import lvl2 from "../assets/alert_lvl2.svg";

const bleachingAlertIntervals = [
  {
    max: 5,
    image: noStress,
    color: "#C6E5FA",
  },
  {
    max: 10,
    image: warning,
    color: "#FFF200",
  },
  {
    max: 15,
    image: watch,
    color: "#F8AB00",
  },
  {
    max: 20,
    image: lvl1,
    color: "#EF0000",
  },
  {
    max: Infinity,
    image: lvl2,
    color: "#940000",
  },
];

type Interval = {
  max: number;
  image: string;
  color: string;
};

const findInterval = (degreeHeatingWeeks?: number | null): Interval => {
  const interval = bleachingAlertIntervals.find(
    (item) => (degreeHeatingWeeks || 0) < item.max
  );
  return interval || bleachingAlertIntervals[0];
};

export const alertFinder = (degreeHeatingWeeks?: number | null): string => {
  return findInterval(degreeHeatingWeeks).image;
};

export const alertColorFinder = (
  degreeHeatingWeeks?: number | null
): string => {
  return findInterval(degreeHeatingWeeks).color;
};

export default { alertFinder, alertColorFinder };
