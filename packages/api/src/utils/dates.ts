import { DateTime } from '../luxon-extensions';

export function getStartEndDate(endDate: Date, hours: number = 24) {
  const endMoment = DateTime.fromJSDate(endDate);
  const startMoment = endMoment.minus({ hours });
  return [startMoment.toISOString(), endMoment.toISOString()];
}

// Util function to get the [startDate, endDate] time interval for time series data.
// If no value for endDate is passed, then we define endDate as "now".
// If no value for startDate is passed, then we define startDate as three months before the endDate.
export function getDefaultDates(start?: string, end?: string) {
  const endDate = end ? new Date(end) : new Date();
  const startDate = start
    ? new Date(start)
    : new Date(new Date(endDate).setMonth(endDate.getMonth() - 3));

  return { startDate, endDate };
}
