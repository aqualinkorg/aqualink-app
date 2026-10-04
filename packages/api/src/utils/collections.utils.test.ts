import { Repository } from 'typeorm';
import { getHistoricalCollectionData } from './collections.utils';
import { DailyData } from '../sites/daily-data.entity';
import { Site } from '../sites/sites.entity';

describe('historical collection observation provenance', () => {
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
    expect(query.addSelect).toHaveBeenCalledWith(
      'daily_data.date',
      'observationDate',
    );
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
});
