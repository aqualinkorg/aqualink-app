import { DateTime } from 'luxon-extensions';

export const toMapDateParam = (date: Date | null) =>
  date ? DateTime.fromJSDate(date).toISODate() || undefined : undefined;
