import { DateTime } from 'luxon-extensions';

const DATE_PARAM_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export const todayDateParam = () => DateTime.now().toFormat('yyyy-MM-dd');

export const isHistoricalDateParam = (value: string) => {
  if (!DATE_PARAM_REGEX.test(value)) {
    return false;
  }

  const date = DateTime.fromISO(value, { zone: 'UTC' });
  return date.isValid && date <= DateTime.now().endOf('day');
};
