import {
  getHistoricalSince,
  getHistoricalUntil,
  HISTORICAL_DATA_MAX_AGE_DAYS,
  IsValidCalendarDate,
} from './historical-date.utils';

describe('historical date utils', () => {
  it('resolves a date to the end of that UTC day', () => {
    expect(getHistoricalUntil('2024-04-01').toISOString()).toBe(
      '2024-04-01T23:59:59.999Z',
    );
  });

  it('computes the start of the staleness window', () => {
    const since = getHistoricalSince(getHistoricalUntil('2024-04-10'));
    expect(since.toISOString()).toBe(
      `2024-04-0${10 - HISTORICAL_DATA_MAX_AGE_DAYS}T00:00:00.000Z`,
    );
  });

  it('validates calendar dates', () => {
    const validator = new IsValidCalendarDate();
    expect(validator.validate(undefined)).toBe(true);
    expect(validator.validate('2024-02-29')).toBe(true);
    expect(validator.validate('2023-02-29')).toBe(false);
    expect(validator.validate('2024-13-01')).toBe(false);
    expect(validator.validate(20240101)).toBe(false);
  });
});
