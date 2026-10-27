import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { FilterSiteDto } from '../sites/dto/filter-site.dto';
import { HistoricalDateQueryDto } from '../sites/dto/historical-date-query.dto';
import { historicalDateBounds } from './historical-data';

describe('historical UTC date validation', () => {
  it.each([
    '2020-02-30',
    '2020-2-01',
    '2020-01-01T12:00:00Z',
    'bad',
    '9999-01-01',
  ])('rejects invalid or future date %s', (asOf) => {
    expect(() => historicalDateBounds(asOf)).toThrow();
  });
  it('uses an exclusive next-midnight cutoff across leap day', () => {
    expect(historicalDateBounds('2020-02-29')).toEqual({
      start: new Date('2020-02-29T00:00:00Z'),
      end: new Date('2020-03-01T00:00:00Z'),
    });
  });
  it('validates inherited filters and optional single-site query dates', async () => {
    expect(
      await validate(plainToInstance(FilterSiteDto, { asOf: '2020-02-30' })),
    ).not.toHaveLength(0);
    expect(
      await validate(plainToInstance(HistoricalDateQueryDto, {})),
    ).toHaveLength(0);
    expect(
      await validate(
        plainToInstance(HistoricalDateQueryDto, { asOf: '2020-02-29' }),
      ),
    ).toHaveLength(0);
  });
});
