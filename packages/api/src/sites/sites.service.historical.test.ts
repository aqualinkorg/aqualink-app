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
  const createHistoricalBuilder = () => {
    let requestedDate: string | undefined;
    const builder = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockImplementation((condition, parameters) => {
        if (condition.includes('CAST(:date AS date)')) {
          requestedDate = parameters.date;
        }
        return builder;
      }),
      distinctOn: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      addOrderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      getRawAndEntities: jest.fn().mockResolvedValue({
        entities: [boundarySnapshot],
        raw: [
          {
            daily_data_id: boundarySnapshot.id,
            historical_data_date: selectedDate,
          },
        ],
      }),
      requestedDate: () => requestedDate,
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
  });

  it('passes a calendar string to the site-list query and uses its SQL date projection', async () => {
    const historicalBuilder = createHistoricalBuilder();
    const service = createService(historicalBuilder);

    const [result] = await service.find({ date: selectedDate });

    expect(historicalBuilder.requestedDate()).toBe(selectedDate);
    expect(result.collectionData).toEqual({
      dhw: 2,
      satelliteTemperature: 27.5,
      tempWeeklyAlert: 3,
    });
    expect(result.historicalDataDate).toBe(selectedDate);
  });

  it('passes a calendar string to the site-detail query and uses its SQL date projection', async () => {
    const historicalBuilder = createHistoricalBuilder();
    const service = createService(historicalBuilder);

    const result = await service.findOne(site.id, selectedDate);

    expect(historicalBuilder.requestedDate()).toBe(selectedDate);
    expect(result.collectionData).toEqual({
      dhw: 2,
      satelliteTemperature: 27.5,
      tempWeeklyAlert: 3,
    });
    expect(result.historicalDataDate).toBe(selectedDate);
  });

  it.each(['list', 'detail'])(
    'returns historical %s metrics when the live collection helper is unavailable',
    async (endpoint) => {
      jest
        .spyOn(collectionUtils, 'getCollectionData')
        .mockRejectedValue(new Error('Live data unavailable'));
      const service = createService(createHistoricalBuilder());
      const result =
        endpoint === 'list'
          ? (await service.find({ date: selectedDate }))[0]
          : await service.findOne(site.id, selectedDate);
      expect(result.collectionData?.satelliteTemperature).toBe(27.5);
    },
  );

  it('still returns live collection metrics when no date is selected', async () => {
    const service = createService(createHistoricalBuilder());
    const [listSite] = await service.find({});
    const detailSite = await service.findOne(site.id);
    expect(listSite.collectionData?.satelliteTemperature).toBe(18);
    expect(detailSite.collectionData?.satelliteTemperature).toBe(18);
  });
});
