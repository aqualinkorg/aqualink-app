import { describe, expect, it } from 'vitest';
import { getSiteDetailPath } from './helpers';

describe('getSiteDetailPath', () => {
  it('carries the selected map date and a bounded chart range', () => {
    const url = new URL(
      getSiteDetailPath(42, '2025-03-15'),
      'https://example.test',
    );

    expect(url.pathname).toBe('/sites/42');
    expect(url.searchParams.get('date')).toBe('2025-03-15');
    expect(url.searchParams.get('start')).toBe('2025-02-15');
    expect(url.searchParams.get('end')).toBe('2025-03-15');
  });

  it('keeps the latest-site route unchanged when no date is selected', () => {
    expect(getSiteDetailPath('42')).toBe('/sites/42');
  });
});
