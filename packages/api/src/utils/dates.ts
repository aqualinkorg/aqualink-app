import moment from 'moment-timezone';

export function getStartEndDate(
  endDate: Date,
  localTimezone?: string,
  hours: number = 24,
) {
  const m = localTimezone ? moment.tz(endDate, localTimezone) : moment(endDate);
  const endMoment = m.endOf('day').utc();
  const startMoment = endMoment.clone().subtract(hours, 'hours');
  return [startMoment.format(), endMoment.format()];
}
