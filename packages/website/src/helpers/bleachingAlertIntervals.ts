import noData from '../assets/alerts/alert_nodata.svg';
import pinNoData from '../assets/alerts/pin_nodata.svg';
import noStress from '../assets/alerts/alert_nostress.svg';
import warning from '../assets/alerts/alert_warning.svg';
import watch from '../assets/alerts/alert_watch.svg';
import lvl1 from '../assets/alerts/alert_lvl1.svg';
import lvl2 from '../assets/alerts/alert_lvl2.svg';
import pinNoStress from '../assets/alerts/pin_nostress@2x.png';
import pinWatch from '../assets/alerts/pin_watch@2x.png';
import pinWarning from '../assets/alerts/pin_warning@2x.png';
import pinLvl1 from '../assets/alerts/pin_lvl1@2x.png';
import pinLvl2 from '../assets/alerts/pin_lvl2@2x.png';

export type Interval = {
  image: string;
  color: string;
  icon: string;
  level: number | null;
  label: string;
};

export const noDataInterval: Interval = {
  label: 'no data',
  image: noData,
  color: '#767676',
  icon: pinNoData,
  level: null,
};

/**
 * Calculating bleaching alert level based on NOAA defintions:
 * available at https://coralreefwatch.noaa.gov/subscriptions/vs.php
 * @param weeklyAlertLevel
 * @param historical Keep missing observations distinct only in historical views.
 */
export const findIntervalByLevel = (
  weeklyAlertLevel?: number | null,
  historical = false,
): Interval => {
  switch (weeklyAlertLevel) {
    case null:
    case undefined:
      return historical ? noDataInterval : findIntervalByLevel(0);

    case 0:
      return {
        label: 'no alert',
        image: noStress,
        color: '#C6E5FA',
        icon: pinNoStress,
        level: 0,
      };

    case 1:
      return {
        label: 'watch',
        image: watch,
        color: '#FFF200',
        icon: pinWatch,
        level: 1,
      };

    case 2:
      return {
        label: 'warning',
        image: warning,
        color: '#F8AB00',
        icon: pinWarning,
        level: 2,
      };

    case 3:
      return {
        label: 'level 1',
        image: lvl1,
        color: '#EF0000',
        icon: pinLvl1,
        level: 3,
      };

    case 4:
      return {
        label: 'level 2',
        image: lvl2,
        color: '#940000',
        icon: pinLvl2,
        level: 4,
      };

    default:
      return {
        label: 'no alert',
        image: noStress,
        color: '#C6E5FA',
        icon: pinNoStress,
        level: 0,
      };
  }
};

export const getColorByLevel = (level: number): string =>
  findIntervalByLevel(level).color;

export const alertIconFinder = (
  weeklyAlertLevel?: number | null,
  historical = false,
): string => findIntervalByLevel(weeklyAlertLevel, historical).icon;

export const alertColorFinder = (
  weeklyAlertLevel?: number | null,
  historical = false,
): string => findIntervalByLevel(weeklyAlertLevel, historical).color;

export default { findIntervalByLevel, alertColorFinder, alertIconFinder };
