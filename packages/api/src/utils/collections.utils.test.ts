import { Repository } from 'typeorm';
import { getCollectionData } from './collections.utils';
import { LatestData } from '../time-series/latest-data.entity';
import { Site } from '../sites/sites.entity';

const createQueryBuilderMock = (rows: unknown[]) => {
  const queryBuilder = {
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    addOrderBy: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    getRawMany: jest.fn().mockResolvedValue(rows),
  };
  return queryBuilder;
};

describe('getCollectionData', () => {
  it('maps latest_data values when no historical date is provided', async () => {
    const latestRows = [
      { siteId: 1, metric: 'temp_weekly_alert', value: 3 },
      { siteId: 1, metric: 'satellite_temperature', value: 29.4 },
      { siteId: 2, metric: 'dhw', value: 5 },
    ];
    const latestQueryBuilder = createQueryBuilderMock(latestRows);
    const historicalQueryBuilder = createQueryBuilderMock([]);
    const repository = {
      createQueryBuilder: jest.fn().mockReturnValue(latestQueryBuilder),
      manager: {
        createQueryBuilder: jest.fn().mockReturnValue(historicalQueryBuilder),
      },
    } as unknown as Repository<LatestData>;

    const result = await getCollectionData(
      [{ id: 1 } as Site, { id: 2 } as Site],
      repository,
    );

    expect(repository.createQueryBuilder).toHaveBeenCalledWith('latest_data');
    expect(repository.manager.createQueryBuilder).not.toHaveBeenCalled();
    expect(result).toStrictEqual({
      1: { tempWeeklyAlert: 3, satelliteTemperature: 29.4 },
      2: { dhw: 5 },
    });
  });

  it('maps daily_data snapshot when historical date is provided', async () => {
    const historicalRows = [
      {
        siteId: 1,
        degreeHeatingDays: '14',
        satelliteTemperature: '30.1',
        dailyAlertLevel: '3',
        weeklyAlertLevel: '4',
      },
      {
        siteId: 2,
        degreeHeatingDays: null,
        satelliteTemperature: null,
        dailyAlertLevel: null,
        weeklyAlertLevel: null,
      },
    ];
    const latestQueryBuilder = createQueryBuilderMock([]);
    const historicalQueryBuilder = createQueryBuilderMock(historicalRows);
    const repository = {
      createQueryBuilder: jest.fn().mockReturnValue(latestQueryBuilder),
      manager: {
        createQueryBuilder: jest.fn().mockReturnValue(historicalQueryBuilder),
      },
    } as unknown as Repository<LatestData>;
    const historicalDate = new Date('2024-03-01T23:59:59.000Z');

    const result = await getCollectionData(
      [{ id: 1 } as Site, { id: 2 } as Site],
      repository,
      historicalDate,
    );

    expect(repository.createQueryBuilder).not.toHaveBeenCalled();
    expect(repository.manager.createQueryBuilder).toHaveBeenCalledTimes(1);
    expect(result).toStrictEqual({
      1: {
        dhw: 14,
        satelliteTemperature: 30.1,
        tempAlert: 3,
        tempWeeklyAlert: 4,
      },
      2: {},
    });
  });
});
