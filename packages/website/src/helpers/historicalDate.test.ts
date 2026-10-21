import {
  validHistoricalDate,
  historicalEnd,
  onOrBeforeHistoricalDate,
  historicalRequestEnd,
  historicalRanges,
  withHistoricalDate,
} from './historicalDate';

describe('historical date boundaries', () => {
  it('accepts leap days and rejects malformed, impossible and future dates', () => {
    expect(validHistoricalDate('2020-02-29')).toBe(true);
    ['2020-02-30', '2020-2-01', '2020-01-01T00:00:00Z', '9999-01-01'].forEach(
      (date) => expect(validHistoricalDate(date)).toBe(false),
    );
    expect(historicalEnd('2020-02-29')).toBe('2020-02-29T23:59:59.999Z');
  });
  it('caps requests at UTC midnight while retaining an earlier end', () => {
    expect(historicalRequestEnd(undefined, '2020-02-29')).toBe(
      historicalEnd('2020-02-29'),
    );
    expect(
      historicalRequestEnd('2020-03-01T01:00:00+02:00', '2020-02-29'),
    ).toBe('2020-03-01T01:00:00+02:00');
    expect(historicalRequestEnd('2020-03-02T00:00:00Z', '2020-02-29')).toBe(
      historicalEnd('2020-02-29'),
    );
  });
  it('removes future-only source ranges and clips ranges spanning the cutoff', () => {
    expect(
      historicalRanges(
        {
          topTemperature: [
            {
              type: 'spotter',
              depth: null,
              data: [{ minDate: '2020-01-01', maxDate: '2020-06-01' }],
            },
            {
              type: 'hobo',
              depth: null,
              data: [{ minDate: '2021-01-01', maxDate: '2021-06-01' }],
            },
          ],
        },
        '2020-02-29',
      ),
    ).toEqual({
      topTemperature: [
        {
          type: 'spotter',
          depth: null,
          data: [
            { minDate: '2020-01-01', maxDate: historicalEnd('2020-02-29') },
          ],
        },
      ],
    });
  });
  it('preserves navigation filters and fragments when selecting or clearing a date', () => {
    expect(
      withHistoricalDate('/sites/1?surveyPoint=2#temperature', '2020-02-29'),
    ).toBe('/sites/1?surveyPoint=2&asOf=2020-02-29#temperature');
    expect(withHistoricalDate('/map?zoom=4&asOf=2020-02-29')).toBe(
      '/map?zoom=4',
    );
  });
});

it('excludes later surveys and unknown dates from a historical view', () => {
  expect(onOrBeforeHistoricalDate('2020-06-16T00:00:00Z', '2020-06-15')).toBe(
    false,
  );
  expect(onOrBeforeHistoricalDate('2020-06-15T23:59:59Z', '2020-06-15')).toBe(
    true,
  );
  expect(onOrBeforeHistoricalDate(undefined, '2020-06-15')).toBe(false);
  expect(onOrBeforeHistoricalDate(undefined)).toBe(true);
});
