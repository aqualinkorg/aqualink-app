import type { DataSource, ObjectLiteral, Repository } from 'typeorm';
import type { ReefCheckSurvey } from 'reef-check-surveys/reef-check-surveys.entity';
import type { Region } from '../regions/regions.entity';
import type { SiteApplication } from '../site-applications/site-applications.entity';
import type { LatestData } from '../time-series/latest-data.entity';
import type { TimeSeries } from '../time-series/time-series.entity';
import type { User } from '../users/users.entity';
import type { DailyData } from './daily-data.entity';
import type { ExclusionDates } from './exclusion-dates.entity';
import type { HistoricalMonthlyMean } from './historical-monthly-mean.entity';
import type { ScheduledUpdate } from './scheduled-updates.entity';
import type { Site } from './sites.entity';
import type { Sources } from './sources.entity';
import { SitesService } from './sites.service';
import * as siteUtils from '../utils/site.utils';
import * as collectionUtils from '../utils/collections.utils';

describe('SitesService historical date cutoff', () => {
  const selectedDate = '2024-03-15';
  const cutoff = new Date('2024-03-15T23:59:59.999Z');
  const site = { id: 42, name: 'Boundary site' } as Site;
  const boundarySnapshot = {
    id: 1,
    site,
    date: cutoff,
    degreeHeatingDays: 14,
    satelliteTemperature: 27.5,
    weeklyAlertLevel: 3,
  } as DailyData;
  const nextDaySnapshot = {
    ...boundarySnapshot,
    id: 2,
    date: new Date('2024-03-16T00:00:00.000Z'),
    satelliteTemperature: 99,
  } as DailyData;

  const createHistoricalBuilder = () => {
    let requestedCutoff: Date | undefined;
    const latestEligibleSnapshot = () =>
      [boundarySnapshot, nextDaySnapshot].reduce<DailyData | undefined>(
        (latest, snapshot) =>
          snapshot.date.getTime() <= requestedCutoff!.getTime() &&
          (!latest || snapshot.date.getTime() > latest.date.getTime())
            ? snapshot
            : latest,
        undefined,
      );
    const builder = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockImplementation((condition, parameters) => {
        if (condition === 'daily_data.date <= :date') {
          requestedCutoff = parameters.date;
        }
        return builder;
      }),
      distinctOn: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      addOrderBy: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockImplementation(async () => {
        const snapshot = latestEligibleSnapshot();
        return snapshot ? [snapshot] : [];
      }),
      getOne: jest
        .fn()
        .mockImplementation(async () => latestEligibleSnapshot()),
      requestedCutoff: () => requestedCutoff,
    };

    return builder;
  };

  const emptyRepository = <T extends ObjectLiteral>(): Repository<T> =>
    ({}) as unknown as Repository<T>;

  const createService = (
    historicalBuilder: ReturnType<typeof createHistoricalBuilder>,
  ) => {
    const listQueryBuilder = {
      andWhere: jest.fn().mockReturnThis(),
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([site]),
    };

    const siteRepository = {
      createQueryBuilder: jest.fn().mockReturnValue(listQueryBuilder),
      findOne: jest.fn().mockResolvedValue(site),
    };
    const dailyDataRepository = {
      createQueryBuilder: jest.fn().mockReturnValue(historicalBuilder),
    };

    return new SitesService(
      siteRepository as unknown as Repository<Site>,
      emptyRepository<SiteApplication>(),
      dailyDataRepository as unknown as Repository<DailyData>,
      emptyRepository<Region>(),
      emptyRepository<ExclusionDates>(),
      emptyRepository<HistoricalMonthlyMean>(),
      emptyRepository<User>(),
      emptyRepository<Sources>(),
      emptyRepository<LatestData>(),
      emptyRepository<TimeSeries>(),
      emptyRepository<ScheduledUpdate>(),
      emptyRepository<ReefCheckSurvey>(),
      {} as unknown as DataSource,
    );
  };

  beforeEach(() => {
    process.env.TZ = 'Asia/Tokyo';
    jest.spyOn(collectionUtils, 'getCollectionData').mockResolvedValue({
      [site.id]: { satelliteTemperature: 18 },
    });
    jest.spyOn(siteUtils, 'hasHoboDataSubQuery').mockResolvedValue(new Set());
    jest
      .spyOn(siteUtils, 'getWaterQualityDataSubQuery')
      .mockResolvedValue(new Map());
    jest.spyOn(siteUtils, 'getReefCheckDataSubQuery').mockResolvedValue({});
    jest.spyOn(siteUtils, 'getSite').mockResolvedValue(site);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    process.env.TZ = 'UTC';
  });

  it('uses the inclusive UTC end of day for the site-list service query', async () => {
    const historicalBuilder = createHistoricalBuilder();
    const service = createService(historicalBuilder);

    const [result] = await service.find({ date: selectedDate });

    expect(historicalBuilder.requestedCutoff()).toEqual(cutoff);
    expect(nextDaySnapshot.date.getTime()).toBeGreaterThan(cutoff.getTime());
    expect(result.collectionData).toEqual({
      dhw: 2,
      satelliteTemperature: 27.5,
      tempWeeklyAlert: 3,
    });
    expect(result.historicalDataDate).toBe(selectedDate);
  });

  it('uses the same inclusive UTC end of day for the site-detail service query', async () => {
    const historicalBuilder = createHistoricalBuilder();
    const service = createService(historicalBuilder);

    const result = await service.findOne(site.id, selectedDate);

    expect(historicalBuilder.requestedCutoff()).toEqual(cutoff);
    expect(nextDaySnapshot.date.getTime()).toBeGreaterThan(cutoff.getTime());
    expect(result.collectionData).toEqual({
      dhw: 2,
      satelliteTemperature: 27.5,
      tempWeeklyAlert: 3,
    });
    expect(result.historicalDataDate).toBe(selectedDate);
  });
});
