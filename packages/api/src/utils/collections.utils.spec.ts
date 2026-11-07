import { BadRequestException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { DailyData } from '../sites/daily-data.entity';
import { Site } from '../sites/sites.entity';
import {
  getHistoricalCollectionData,
  parseHistoricalCutoffDate,
} from './collections.utils';

const createMockDailyDataRepo = (rows: unknown[]) => {
  const queryBuilder = {
    distinctOn: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    addOrderBy: jest.fn().mockReturnThis(),
    getRawMany: jest.fn().mockResolvedValue(rows),
  };

  return {
    repo: {
      createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
    } as unknown as Repository<DailyData>,
    queryBuilder,
  };
};

describe('collections.utils historical collection data', () => {
  it('converts a valid ISO date string to the UTC end-of-day cutoff', () => {
    const cutoff = parseHistoricalCutoffDate('2024-04-15');
    expect(cutoff.toISOString()).toBe('2024-04-15T23:59:59.999Z');
  });

  it('throws BadRequestException when historical date is invalid', async () => {
    const { repo } = createMockDailyDataRepo([]);
    await expect(
      getHistoricalCollectionData([{ id: 1 } as Site], {
        dailyDataRepository: repo,
        date: 'not-a-valid-date',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('returns an empty map without querying when sites list is empty', async () => {
    const { repo, queryBuilder } = createMockDailyDataRepo([]);
    const result = await getHistoricalCollectionData([], {
      dailyDataRepository: repo,
      date: '2024-04-15',
    });

    expect(result).toEqual({});
    expect(queryBuilder.getRawMany).not.toHaveBeenCalled();
  });

  it('maps latest daily_data rows on or before target date into CollectionDataDto', async () => {
    const { repo, queryBuilder } = createMockDailyDataRepo([
      {
        siteId: 10,
        satelliteTemperature: 29.4,
        degreeHeatingDays: 28,
        dailyAlertLevel: 2,
        weeklyAlertLevel: 3,
      },
      {
        siteId: 20,
        satelliteTemperature: 26.1,
        degreeHeatingDays: null,
        dailyAlertLevel: 1,
        weeklyAlertLevel: null,
      },
    ]);

    const result = await getHistoricalCollectionData(
      [{ id: 10 } as Site, { id: 20 } as Site],
      {
        dailyDataRepository: repo,
        date: '2024-04-15',
      },
    );

    expect(queryBuilder.andWhere).toHaveBeenCalledWith(
      'daily_data.date <= :endOfDate',
      { endOfDate: new Date('2024-04-15T23:59:59.999Z') },
    );
    expect(result).toEqual({
      10: {
        satelliteTemperature: 29.4,
        dhw: 4,
        tempAlert: 2,
        tempWeeklyAlert: 3,
      },
      20: {
        satelliteTemperature: 26.1,
        tempAlert: 1,
        tempWeeklyAlert: 1,
      },
    });
  });
});
