import { describe, expect, it } from 'vitest';
import { toMapDateParam } from './mapDate';

describe('toMapDateParam', () => {
  it('keeps the picked calendar day in the URL parameter', () => {
    const pickedDate = new Date(2026, 4, 20);

    expect(toMapDateParam(pickedDate)).toBe('2026-05-20');
  });

  it('clears the date query parameter when no map date is selected', () => {
    expect(toMapDateParam(null)).toBeUndefined();
  });
});
