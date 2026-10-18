/* eslint-disable fp/no-mutation */
import { ObjectLiteral, Repository } from 'typeorm';
import { getCollectionData } from './collections.utils';
import { Site } from '../sites/sites.entity';
import { LatestData } from '../time-series/latest-data.entity';
import { TimeSeries } from '../time-series/time-series.entity';

const mockQueryBuilder = (rows: any[]) => {
  const qb: Record<string, jest.Mock> = {
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    innerJoin: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getRawMany: jest.fn().mockResolvedValue(rows),
  };
  return qb;
};

const mockRepo = <T extends ObjectLiteral>(qb: Record<string, jest.Mock>) =>
  ({
    createQueryBuilder: jest.fn().mockReturnValue(qb),
  }) as unknown as Repository<T>;

const sites = [{ id: 1 }, { id: 2 }] as Site[];

describe('getCollectionData', () => {
  it('returns an empty object when no sites are given', async () => {
    const latestQb = mockQueryBuilder([]);
    const latestRepo = mockRepo<LatestData>(latestQb);

    const res = await getCollectionData([], latestRepo);

    expect(res).toEqual({});
    expect(latestRepo.createQueryBuilder).not.toHaveBeenCalled();
  });

  it('reads from latest_data and camel-cases metrics when no asOf is given', async () => {
    const latestQb = mockQueryBuilder([
      { siteId: 1, metric: 'top_temperature', value: 28.5 },
      { siteId: 1, metric: 'dhw', value: 2 },
      { siteId: 2, metric: 'satellite_temperature', value: 27.1 },
    ]);
    const latestRepo = mockRepo<LatestData>(latestQb);

    const res = await getCollectionData(sites, latestRepo);

    expect(latestRepo.createQueryBuilder).toHaveBeenCalledWith('latest_data');
    expect(res).toEqual({
      1: { topTemperature: 28.5, dhw: 2 },
      2: { satelliteTemperature: 27.1 },
    });
  });

  it('queries time_series at or before asOf with the wider window for low-frequency sources', async () => {
    const asOf = new Date('2024-03-01T00:00:00.000Z');
    const tsQb = mockQueryBuilder([
      { siteId: 1, metric: 'top_temperature', value: 25.3 },
    ]);
    const tsRepo = mockRepo<TimeSeries>(tsQb);
    const latestQb = mockQueryBuilder([]);
    const latestRepo = mockRepo<LatestData>(latestQb);

    const res = await getCollectionData(sites, latestRepo, {
      asOf,
      timeSeriesRepository: tsRepo,
    });

    expect(tsRepo.createQueryBuilder).toHaveBeenCalledWith('time_series');
    expect(latestRepo.createQueryBuilder).not.toHaveBeenCalled();

    const asOfCall = tsQb.andWhere.mock.calls.find(
      ([sql]) => sql === 'time_series.timestamp <= :asOf',
    );
    expect(asOfCall?.[1]).toEqual({ asOf });

    const windowCall = tsQb.andWhere.mock.calls.find(([sql]) =>
      sql.includes('weekAgo'),
    );
    expect(windowCall?.[1].weekAgo).toEqual(
      new Date(asOf.getTime() - 7 * 24 * 60 * 60 * 1000),
    );
    expect(windowCall?.[1].twoYearsAgo).toEqual(
      new Date(asOf.getTime() - 2 * 365 * 24 * 60 * 60 * 1000),
    );
    expect(windowCall?.[0]).toContain('sonde');
    expect(windowCall?.[0]).toContain('sheet_data');

    expect(res).toEqual({ 1: { topTemperature: 25.3 } });
  });

  it('falls back to latest_data when asOf is given without a time series repository', async () => {
    const latestQb = mockQueryBuilder([{ siteId: 1, metric: 'dhw', value: 4 }]);
    const latestRepo = mockRepo<LatestData>(latestQb);

    const res = await getCollectionData(sites, latestRepo, {
      asOf: new Date('2024-03-01T00:00:00.000Z'),
    });

    expect(latestRepo.createQueryBuilder).toHaveBeenCalledWith('latest_data');
    expect(res).toEqual({ 1: { dhw: 4 } });
  });
});
