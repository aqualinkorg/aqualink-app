import { Repository } from 'typeorm';
import { DailyData } from '../sites/daily-data.entity';
import { Site } from '../sites/sites.entity';
import { getCollectionDataAtDate } from './collections.utils';

describe('getCollectionDataAtDate', () => {
  it('maps daily data rows to collection data fields', async () => {
    const getRawMany = jest.fn().mockResolvedValue([
      {
        siteId: 1,
        satelliteTemperature: 28.5,
        degreeHeatingDays: 3.2,
        weeklyAlertLevel: 2,
      },
      {
        siteId: 2,
        satelliteTemperature: null,
        degreeHeatingDays: 1.5,
        weeklyAlertLevel: null,
      },
    ]);

    const queryBuilder = {
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getRawMany,
    };

    const repository = {
      createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
    } as unknown as Repository<DailyData>;

    const result = await getCollectionDataAtDate(
      [{ id: 1 }, { id: 2 }] as Site[],
      repository,
      '2024-03-01',
    );

    expect(repository.createQueryBuilder).toHaveBeenCalledWith('daily_data');
    expect(queryBuilder.andWhere).toHaveBeenCalledWith(
      'DATE(daily_data.date) = DATE(:date)',
      { date: '2024-03-01' },
    );
    expect(result).toEqual({
      1: {
        satelliteTemperature: 28.5,
        dhw: 3.2,
        tempWeeklyAlert: 2,
      },
      2: {
        dhw: 1.5,
      },
    });
  });

  it('does not query daily data when there are no sites', async () => {
    const repository = {
      createQueryBuilder: jest.fn(),
    } as unknown as Repository<DailyData>;

    await expect(
      getCollectionDataAtDate([], repository, '2024-03-01'),
    ).resolves.toEqual({});

    expect(repository.createQueryBuilder).not.toHaveBeenCalled();
  });
});
