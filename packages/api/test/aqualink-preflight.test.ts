// Credential-free baseline and historical snapshot regression tests.
import 'reflect-metadata';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { dataSourceOptions } from '../ormconfig';
import { Site, SiteStatus } from '../src/sites/sites.entity';
import { DailyData } from '../src/sites/daily-data.entity';
import { SitesModule } from '../src/sites/sites.module';
import { GlobalValidationPipe } from '../src/validations/global-validation.pipe';
import * as temperature from '../src/utils/temperature';
import * as sofar from '../src/utils/sofar';

// The normal API suite can use sponsor services. This suite is opt-in because
// it requires an isolated, credential-free PostGIS database instead.
const describePreflight =
  process.env.AQUALINK_PREFLIGHT === '1' ? describe : describe.skip;

describePreflight('Credential-free historical-read regressions', () => {
  let app: INestApplication | undefined;
  let dataSource: DataSource;
  let siteId: number;
  let otherSiteId: number;
  const createdSiteIds: number[] = [];
  const forbiddenServiceCalls: jest.SpyInstance[] = [];

  const rejectExternalService = () => {
    throw new Error(
      'This database preflight must not call external data services',
    );
  };

  beforeAll(async () => {
    // Migrations are permitted only on a named, disposable loopback database.
    const databaseUrl = process.env.TEST_DATABASE_URL;
    if (
      process.env.AQUALINK_PREFLIGHT !== '1' ||
      process.env.NODE_ENV !== 'test' ||
      !databaseUrl
    ) {
      throw new Error(
        'Set AQUALINK_PREFLIGHT=1, NODE_ENV=test and TEST_DATABASE_URL explicitly',
      );
    }
    const parsedUrl = new URL(databaseUrl);
    if (
      !['postgres:', 'postgresql:'].includes(parsedUrl.protocol) ||
      !['localhost', '127.0.0.1', '[::1]'].includes(parsedUrl.hostname) ||
      !/^\/aqualink_preflight(?:_[a-z0-9]+)*$/.test(parsedUrl.pathname)
    ) {
      throw new Error(
        'Use a loopback Postgres database named aqualink_preflight or aqualink_preflight_<suffix>',
      );
    }
    if (new Date().getTimezoneOffset() !== 0) {
      throw new Error('Run the database preflight with TZ=UTC');
    }
    const credentialKeys = [
      'SOFAR_API_TOKEN',
      'GCS_BUCKET',
      'GCS_KEYFILE',
      'GCS_PROJECT',
      'GC_PROJECT',
      'GOOGLE_APPLICATION_CREDENTIALS',
      'FIREBASE_PRIVATE_KEY',
    ];
    if (credentialKeys.some((key) => Boolean(process.env[key]))) {
      throw new Error(
        'Unset sponsor cloud and SOFAR credentials for this preflight',
      );
    }

    // Keep the real controller, service, ORM, SQL and migrations. Fail on an
    // accidental call to unrelated climatology or live spotter services.
    forbiddenServiceCalls.push(
      jest
        .spyOn(temperature, 'getMMM')
        .mockImplementation(rejectExternalService),
      jest
        .spyOn(temperature, 'getHistoricalMonthlyMeans')
        .mockImplementation(rejectExternalService),
      jest
        .spyOn(sofar, 'getSpotterData')
        .mockImplementation(rejectExternalService),
      jest
        .spyOn(sofar, 'sofarLatest')
        .mockImplementation(rejectExternalService),
      jest
        .spyOn(sofar, 'sofarHindcast')
        .mockImplementation(rejectExternalService),
    );

    const moduleFixture = await Test.createTestingModule({
      imports: [
        // Match the option adapter used by the production ConfigService.
        TypeOrmModule.forRoot({
          ...dataSourceOptions,
          url: databaseUrl,
          retryAttempts: 1,
        } as TypeOrmModuleOptions),
        SitesModule,
      ],
    }).compile();
    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new GlobalValidationPipe({
        transform: true,
        skipTransformIds: ['appId'],
      }),
    );
    await app.init();
    dataSource = app.get(DataSource);
    await dataSource.runMigrations({ transaction: 'each' });

    const siteRepository = dataSource.getRepository(Site);
    const primarySite = await siteRepository.save({
      name: 'Local preflight primary site',
      polygon: { type: 'Point', coordinates: [-170.123401, 10.123401] },
      status: SiteStatus.Approved,
      display: true,
      timezone: 'UTC',
      sensorId: null,
      videoStream: null,
    });
    siteId = primarySite.id;
    createdSiteIds.push(siteId);
    const otherSite = await siteRepository.save({
      name: 'Local preflight other site',
      polygon: { type: 'Point', coordinates: [-170.123402, 10.123402] },
      status: SiteStatus.Approved,
      display: true,
      timezone: 'UTC',
      sensorId: null,
      videoStream: null,
    });
    otherSiteId = otherSite.id;
    createdSiteIds.push(otherSiteId);

    await dataSource.getRepository(DailyData).save([
      {
        site: primarySite,
        date: new Date('2024-01-01T23:59:59.999Z'),
        satelliteTemperature: 21,
        dailyAlertLevel: 0,
      },
      {
        site: primarySite,
        date: new Date('2024-01-02T00:00:00.000Z'),
        satelliteTemperature: 22,
        dailyAlertLevel: 0,
      },
      {
        site: primarySite,
        date: new Date('2024-01-02T23:59:59.999Z'),
        satelliteTemperature: 23,
        dailyAlertLevel: 1,
        weeklyAlertLevel: 4,
        degreeHeatingDays: 14,
      },
      {
        site: primarySite,
        date: new Date('2024-01-03T00:00:00.000Z'),
        satelliteTemperature: 24,
        dailyAlertLevel: 2,
      },
      {
        site: primarySite,
        date: new Date('2024-01-04T00:00:00.000Z'),
        satelliteTemperature: 0,
        degreeHeatingDays: 0,
        dailyAlertLevel: 0,
        weeklyAlertLevel: 0,
      },
      {
        site: otherSite,
        date: new Date('2024-01-02T12:00:00.000Z'),
        satelliteTemperature: 31,
        dailyAlertLevel: null,
      },
    ]);
  });

  it('uses real PostGIS with the repository migrations', async () => {
    const [database] = await dataSource.query(
      'SELECT current_database() AS name, PostGIS_Version() AS postgis',
    );
    expect(database.name).toMatch(/^aqualink_preflight/);
    expect(database.postgis).toMatch(/^\d/);
    const migrations = await dataSource.query('SELECT id FROM migrations');
    expect(migrations.length).toBeGreaterThan(0);
  });

  it('includes both UTC range boundaries and returns newest observation first', async () => {
    const response = await request(app!.getHttpServer())
      .get(`/sites/${siteId}/daily_data`)
      .query({
        start: '2024-01-02T00:00:00.000Z',
        end: '2024-01-02T23:59:59.999Z',
      });
    expect(response.status).toBe(200);
    expect(
      response.body.map((row) => [row.date, row.satelliteTemperature]),
    ).toEqual([
      ['2024-01-02T23:59:59.999Z', 23],
      ['2024-01-02T00:00:00.000Z', 22],
    ]);
    expect(response.body[1].dailyAlertLevel).toBe(0);
  });

  it('keeps rows from a second site separate', async () => {
    const response = await request(app!.getHttpServer())
      .get(`/sites/${otherSiteId}/daily_data`)
      .query({ start: '2024-01-02', end: '2024-01-03' });
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].satelliteTemperature).toBe(31);
    expect(response.body[0].dailyAlertLevel).toBeNull();
  });

  it('returns an empty array when the range has no observation', async () => {
    const response = await request(app!.getHttpServer())
      .get(`/sites/${siteId}/daily_data`)
      .query({ start: '2023-01-01', end: '2023-01-02' });
    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  it.each([
    { start: 'not-a-date', end: '2024-01-03' },
    { start: '2024-01-01', end: 'not-a-date' },
  ])('rejects an invalid date with 400: %j', async (range) => {
    const response = await request(app!.getHttpServer())
      .get(`/sites/${siteId}/daily_data`)
      .query(range);
    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Start or end is not a valid date');
  });

  it('returns 404 for a site that does not exist', async () => {
    const response = await request(app!.getHttpServer())
      .get('/sites/2147483647/daily_data')
      .query({ start: '2024-01-01', end: '2024-01-03' });
    expect(response.status).toBe(404);
  });

  it('keeps the real site identifier validation', async () => {
    const response = await request(app!.getHttpServer()).get(
      '/sites/not-an-integer/daily_data',
    );
    expect(response.status).toBe(400);
  });

  it('returns the last exact-day snapshot with converted heat stress', async () => {
    const response = await request(app!.getHttpServer())
      .get(`/sites/${siteId}`)
      .query({ date: '2024-01-02' });
    expect(response.status).toBe(200);
    expect(response.body.historicalDate).toBe('2024-01-02');
    expect(response.body.historicalObservedAt).toBe('2024-01-02T23:59:59.999Z');
    expect(response.body.collectionData).toEqual({
      satelliteTemperature: 23,
      dhw: 2,
      tempAlert: 1,
      tempWeeklyAlert: 4,
    });
    expect(response.body.videoStream).toBeNull();
  });

  it('includes UTC midnight and preserves all zero measurements', async () => {
    const response = await request(app!.getHttpServer())
      .get(`/sites/${siteId}`)
      .query({ date: '2024-01-04' });
    expect(response.status).toBe(200);
    expect(response.body.historicalObservedAt).toBe('2024-01-04T00:00:00.000Z');
    expect(response.body.collectionData).toEqual({
      satelliteTemperature: 0,
      dhw: 0,
      tempAlert: 0,
      tempWeeklyAlert: 0,
    });
  });

  it('omits null measurements instead of treating them as zero', async () => {
    const response = await request(app!.getHttpServer())
      .get(`/sites/${otherSiteId}`)
      .query({ date: '2024-01-02' });
    expect(response.status).toBe(200);
    expect(response.body.historicalObservedAt).toBe('2024-01-02T12:00:00.000Z');
    expect(response.body.collectionData).toEqual({ satelliteTemperature: 31 });
  });

  it('does not fall back to an older day when the requested day is empty', async () => {
    const response = await request(app!.getHttpServer())
      .get(`/sites/${siteId}`)
      .query({ date: '2024-01-05' });
    expect(response.status).toBe(200);
    expect(response.body.historicalDate).toBe('2024-01-05');
    expect(response.body.historicalObservedAt).toBeNull();
    expect(response.body.collectionData).toEqual({});
  });

  it('keeps the same snapshot contract on list and detail with one batched query', async () => {
    const queryLog = jest.spyOn(dataSource.logger, 'logQuery');
    try {
      const response = await request(app!.getHttpServer())
        .get('/sites')
        .query({ name: 'Local preflight', date: '2024-01-02' });
      expect(response.status).toBe(200);
      const primary = response.body.find((site) => site.id === siteId);
      const other = response.body.find((site) => site.id === otherSiteId);
      expect(primary.historicalDate).toBe('2024-01-02');
      expect(primary.historicalObservedAt).toBe('2024-01-02T23:59:59.999Z');
      expect(primary.collectionData).toEqual({
        satelliteTemperature: 23,
        dhw: 2,
        tempAlert: 1,
        tempWeeklyAlert: 4,
      });
      expect(other.historicalObservedAt).toBe('2024-01-02T12:00:00.000Z');
      expect(other.collectionData).toEqual({ satelliteTemperature: 31 });
      const snapshotQueries = queryLog.mock.calls.filter(([sql]) =>
        /FROM "daily_data"/.test(sql),
      );
      expect(snapshotQueries).toHaveLength(1);
    } finally {
      queryLog.mockRestore();
    }
  });

  it('returns explicit missing-day metadata for every site in a list', async () => {
    const response = await request(app!.getHttpServer())
      .get('/sites')
      .query({ name: 'Local preflight', date: '2024-01-05' });
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
    response.body.forEach((site) => {
      expect(site.historicalDate).toBe('2024-01-05');
      expect(site.historicalObservedAt).toBeNull();
      expect(site.collectionData).toEqual({});
    });
  });

  it('keeps historical metadata absent when date is omitted', async () => {
    await Promise.all(
      ['/sites', `/sites/${siteId}`].map(async (path) => {
        const response = await request(app!.getHttpServer()).get(path);
        expect(response.status).toBe(200);
        const rows = Array.isArray(response.body)
          ? response.body
          : [response.body];
        rows.forEach((site) => {
          expect(site).not.toHaveProperty('historicalDate');
          expect(site).not.toHaveProperty('historicalObservedAt');
        });
      }),
    );
  });

  it.each([
    'date=',
    'date=not-a-date',
    'date=2024-02-30',
    'date=2023-02-29',
    'date=0000-01-01',
    'date=2024-1-02',
    'date=2024-01-02T00%3A00%3A00Z',
    'date=2024-01-02&date=2024-01-03',
    'date%5B%5D=2024-01-02',
    'date%5B0%5D=2024-01-02',
    'date%5Byear%5D=2024',
    'date=2024-01-02&date%5B%5D=2024-01-03',
    'date=9999-12-31',
  ])(
    'rejects malformed, repeated or future dates on both routes: %s',
    async (query) => {
      await Promise.all(
        ['/sites', `/sites/${siteId}`].map(async (path) => {
          const response = await request(app!.getHttpServer()).get(
            `${path}?${query}`,
          );
          expect(response.status).toBe(400);
        }),
      );
    },
  );

  it('accepts leap days and preserves the explicit empty-day response', async () => {
    const response = await request(app!.getHttpServer())
      .get(`/sites/${siteId}`)
      .query({ date: '2024-02-29' });
    expect(response.status).toBe(200);
    expect(response.body.historicalDate).toBe('2024-02-29');
    expect(response.body.historicalObservedAt).toBeNull();
    expect(response.body.collectionData).toEqual({});
  });

  it('keeps missing-site errors for historical detail requests', async () => {
    const response = await request(app!.getHttpServer())
      .get('/sites/2147483647')
      .query({ date: '2024-01-02' });
    expect(response.status).toBe(404);
  });

  afterAll(async () => {
    try {
      if (dataSource?.isInitialized && createdSiteIds.length) {
        await dataSource.getRepository(Site).delete(createdSiteIds);
      }
      forbiddenServiceCalls.forEach((spy) => {
        expect(spy).not.toHaveBeenCalled();
      });
    } finally {
      await app?.close();
      jest.restoreAllMocks();
    }
  });
});
