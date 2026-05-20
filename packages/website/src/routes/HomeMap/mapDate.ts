import { DateTime } from 'luxon-extensions';

export const toUtcEndOfMapDate = (date: Date | null) =>
  date
    ? DateTime.fromJSDate(date)
        .setZone('UTC', { keepLocalTime: true })
        .endOf('day')
        .toISOString() || undefined
    : undefined;
