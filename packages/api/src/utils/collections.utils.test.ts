import { Repository } from 'typeorm';
import { Site } from '../sites/sites.entity';
import { SourceType } from '../sites/schemas/source-type.enum';
import { LatestData } from '../time-series/latest-data.entity';
import { Metric } from '../time-series/metrics.enum';
import { TimeSeries } from '../time-series/time-series.entity';
import { getCollectionData } from './collections.utils';

const queryBuilderMethods = [
  'select',
  'addSelect',
  'innerJoin',
  'where',
  'andWhere',
  'orderBy',
  'addOrderBy',
] as const;

const createQueryBuilderMock = <T>(rows: T[]) => {
  const queryBuilder: Record<string, jest.Mock> = {};

  queryBuilderMethods.forEach((method) => {
    queryBuilder[method] = jest.fn(() => queryBuilder);
  });
  queryBuilder.getRawMany = jest.fn().mockResolvedValue(rows);

  return queryBuilder;
};

describe('getCollectionData', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('uses historical time series data when a date is provided', async () => {
    const date = new Date('2024-08-31T23:59:59.000Z');
    const historicalRows = [
      {
        siteId: 1,
        metric: Metric.SATELLITE_TEMPERATURE,
        value: 30.4,
      },
      {
        siteId: 1,
        metric: Metric.DHW,
        value: 2.1,
      },
      {
        siteId: 2,
        metric: Metric.ALERT,
        value: 1,
      },
    ];
    const queryBuilder = createQueryBuilderMock(historicalRows);
    const latestDataRepository = {
      createQueryBuilder: jest.fn(),
    } as unknown as Repository<LatestData>;
    const timeSeriesRepository = {
      createQueryBuilder: jest.fn(() => queryBuilder),
    } as unknown as Repository<TimeSeries>;

    const result = await getCollectionData(
      [{ id: 1 }, { id: 2 }] as Site[],
      latestDataRepository,
      timeSeriesRepository,
      date,
    );

    expect(result).toEqual({
      1: {
        satelliteTemperature: 30.4,
        dhw: 2.1,
      },
      2: {
        tempAlert: 1,
      },
    });
    expect(latestDataRepository.createQueryBuilder).not.toHaveBeenCalled();
    expect(timeSeriesRepository.createQueryBuilder).toHaveBeenCalledWith(
      'time_series',
    );
    expect(queryBuilder.where).toHaveBeenCalledWith(
      'sources.site_id IN (:...siteIds)',
      { siteIds: [1, 2] },
    );
    expect(queryBuilder.andWhere).toHaveBeenCalledWith(
      'time_series.timestamp <= :date',
      { date },
    );
  });

  it('uses latest data when no historical date is provided', async () => {
    const latestRows = [
      {
        siteId: 1,
        metric: Metric.BOTTOM_TEMPERATURE,
        value: 27.9,
      },
      {
        siteId: 1,
        metric: Metric.TOP_TEMPERATURE,
        value: 28.2,
      },
    ];
    const queryBuilder = createQueryBuilderMock(latestRows);
    const latestDataRepository = {
      createQueryBuilder: jest.fn(() => queryBuilder),
    } as unknown as Repository<LatestData>;

    const result = await getCollectionData(
      [{ id: 1 }] as Site[],
      latestDataRepository,
    );

    expect(result).toEqual({
      1: {
        bottomTemperature: 27.9,
        topTemperature: 28.2,
      },
    });
    expect(latestDataRepository.createQueryBuilder).toHaveBeenCalledWith(
      'latest_data',
    );
    expect(queryBuilder.where).toHaveBeenCalledWith(
      'site_id IN (:...siteIds)',
      { siteIds: [1] },
    );
    expect(queryBuilder.andWhere).toHaveBeenCalledWith(
      'source != :hoboSource',
      { hoboSource: SourceType.HOBO },
    );
  });

  it('returns an empty map without querying when no sites are provided', async () => {
    const latestDataRepository = {
      createQueryBuilder: jest.fn(),
    } as unknown as Repository<LatestData>;
    const timeSeriesRepository = {
      createQueryBuilder: jest.fn(),
    } as unknown as Repository<TimeSeries>;

    const result = await getCollectionData(
      [],
      latestDataRepository,
      timeSeriesRepository,
      new Date('2024-08-31T23:59:59.000Z'),
    );

    expect(result).toEqual({});
    expect(latestDataRepository.createQueryBuilder).not.toHaveBeenCalled();
    expect(timeSeriesRepository.createQueryBuilder).not.toHaveBeenCalled();
  });
});
