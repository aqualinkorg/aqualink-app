import { Repository } from 'typeorm';
import { getHistoricalCollectionData } from './collections.utils';
import { DailyData } from '../sites/daily-data.entity';
import { Site } from '../sites/sites.entity';

describe('getHistoricalCollectionData', () => {
  it('maps the selected older observation rather than the requested date', async () => {
    const observationDate = new Date('2024-04-10T23:59:59.999Z');
    const query = {
      distinctOn: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      addOrderBy: jest.fn().mockReturnThis(),
      getRawMany: jest.fn().mockResolvedValue([
        {
          siteId: 1,
          observationDate,
          degreeHeatingDays: 14,
          satelliteTemperature: 28,
          dailyAlertLevel: 0,
          weeklyAlertLevel: 1,
        },
      ]),
    };
    const repository = {
      createQueryBuilder: () => query,
    } as unknown as Repository<DailyData>;

    const result = await getHistoricalCollectionData(
      [{ id: 1 } as Site],
      repository,
      '2024-04-15',
    );

    // Latest row per site on or before the end of the requested day (UTC)
    expect(query.distinctOn).toHaveBeenCalledWith(['daily_data.site_id']);
    expect(query.andWhere).toHaveBeenCalledWith('daily_data.date <= :date', {
      date: new Date('2024-04-15T23:59:59.999Z'),
    });
    expect(result[1]).toEqual({
      observationDate,
      dhw: 2,
      satelliteTemperature: 28,
      tempAlert: 0,
      tempWeeklyAlert: 1,
    });
    expect(JSON.parse(JSON.stringify(result))[1].observationDate).toBe(
      '2024-04-10T23:59:59.999Z',
    );
  });

  it('omits metrics that are null in the selected daily row', async () => {
    const query = {
      distinctOn: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      addOrderBy: jest.fn().mockReturnThis(),
      getRawMany: jest.fn().mockResolvedValue([
        {
          siteId: 2,
          observationDate: new Date('2024-04-15T00:00:00.000Z'),
          degreeHeatingDays: null,
          satelliteTemperature: 29.5,
          dailyAlertLevel: null,
          weeklyAlertLevel: null,
        },
      ]),
    };
    const repository = {
      createQueryBuilder: () => query,
    } as unknown as Repository<DailyData>;

    const result = await getHistoricalCollectionData(
      [{ id: 2 } as Site],
      repository,
      '2024-04-15',
    );

    expect(result[2]).toEqual({
      observationDate: new Date('2024-04-15T00:00:00.000Z'),
      satelliteTemperature: 29.5,
    });
  });

  it('returns an empty map for an empty site list', async () => {
    const repository = {
      createQueryBuilder: jest.fn(),
    } as unknown as Repository<DailyData>;

    const result = await getHistoricalCollectionData(
      [],
      repository,
      '2024-04-15',
    );

    expect(result).toEqual({});
    expect(repository.createQueryBuilder).not.toHaveBeenCalled();
  });
});
