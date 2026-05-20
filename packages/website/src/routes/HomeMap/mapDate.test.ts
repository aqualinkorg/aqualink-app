import { describe, expect, it } from 'vitest';
import { toUtcEndOfMapDate } from './mapDate';

describe('toUtcEndOfMapDate', () => {
  it('keeps the picked calendar day when converting to a UTC cutoff', () => {
    const pickedDate = new Date(2026, 4, 20);

    expect(toUtcEndOfMapDate(pickedDate)).toBe('2026-05-20T23:59:59.999Z');
  });

  it('clears the date query parameter when no map date is selected', () => {
    expect(toUtcEndOfMapDate(null)).toBeUndefined();
  });
});
