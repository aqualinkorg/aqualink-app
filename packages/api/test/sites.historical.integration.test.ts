import 'reflect-metadata';
import { randomBytes } from 'crypto';
import { join } from 'path';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { SitesController } from '../src/sites/sites.controller';
import { SitesService } from '../src/sites/sites.service';
import { Site } from '../src/sites/sites.entity';
import { SiteApplication } from '../src/site-applications/site-applications.entity';
import { DailyData } from '../src/sites/daily-data.entity';
import { Region } from '../src/regions/regions.entity';
import { ExclusionDates } from '../src/sites/exclusion-dates.entity';
import { HistoricalMonthlyMean } from '../src/sites/historical-monthly-mean.entity';
import { User } from '../src/users/users.entity';
import { Sources } from '../src/sites/sources.entity';
import { LatestData } from '../src/time-series/latest-data.entity';
import { TimeSeries } from '../src/time-series/time-series.entity';
import { ScheduledUpdate } from '../src/sites/scheduled-updates.entity';
import { ReefCheckSurvey } from '../src/reef-check-surveys/reef-check-surveys.entity';
import { GlobalValidationPipe } from '../src/validations/global-validation.pipe';

// Explicit opt-in: this database must be a disposable local PostgreSQL/PostGIS
// database. Each run creates and removes only its own randomly named schema.
const databaseUrl = process.env.HISTORICAL_TEST_DATABASE_URL;
const integration = databaseUrl ? describe : describe.skip;

integration('historical sites through PostgreSQL and HTTP', () => {
  const schema = `historical_test_${randomBytes(8).toString('hex')}`;
  let dataSource: DataSource;
  let app: INestApplication;

  beforeAll(async () => {
    dataSource = new DataSource({
      type: 'postgres',
      url: databaseUrl,
      schema,
      extra: { options: `-c search_path=${schema},public` },
      namingStrategy: new SnakeNamingStrategy(),
      entities: [join(__dirname, '../src/**/*.entity.ts')],
      synchronize: false,
    });
    await dataSource.initialize();
    await dataSource.query(`CREATE SCHEMA "${schema}"`);
    await dataSource.synchronize();

    await dataSource.query(`
      INSERT INTO site (id, name, polygon, display, timezone) VALUES
      (1, 'Public A', ST_SetSRID(ST_MakePoint(1, 1), 4326), true, 'Asia/Tokyo'),
      (2, 'Public B', ST_SetSRID(ST_MakePoint(2, 2), 4326), true, 'America/Los_Angeles'),
      (3, 'Sparse', ST_SetSRID(ST_MakePoint(3, 3), 4326), true, 'UTC'),
      (4, 'No data', ST_SetSRID(ST_MakePoint(4, 4), 4326), true, 'UTC'),
      (5, 'Hidden', ST_SetSRID(ST_MakePoint(5, 5), 4326), false, 'UTC'),
      (6, 'Microsecond', ST_SetSRID(ST_MakePoint(6, 6), 4326), true, 'UTC')
    `);
    // SQL timestamp literals preserve the UTC calendar values stored by the
    // daily worker, independently of the test process's timezone and pg parser.
    await dataSource.query(`
      INSERT INTO daily_data
        (site_id, date, degree_heating_days, satellite_temperature, weekly_alert_level)
      VALUES
      (1, '2024-03-14 00:00:00', 7, 14, 1),
      (1, '2024-03-15 23:59:59.999', 14, 15, 2),
      (1, '2024-03-16 00:00:00', 21, 99, 3),
      (2, '2024-03-15 01:00:00', 28, 25, 4),
      (3, '2024-01-01 00:00:00', null, null, null),
      (5, '2024-03-15 00:00:00', 35, 55, 5),
      (6, '2024-03-15 23:59:59.999500', 42, 66, 6)
    `);
    await dataSource.query(`
      INSERT INTO sources (id, site_id, type)
      VALUES (1, 1, 'noaa'), (2, 4, 'noaa')
    `);
    await dataSource.query(`
      INSERT INTO time_series (source_id, timestamp, value, metric)
      VALUES (1, now(), 777, 'satellite_temperature'),
             (2, now(), 888, 'satellite_temperature')
    `);
    await dataSource.query('REFRESH MATERIALIZED VIEW latest_data');

    const service = new SitesService(
      dataSource.getRepository(Site),
      dataSource.getRepository(SiteApplication),
      dataSource.getRepository(DailyData),
      dataSource.getRepository(Region),
      dataSource.getRepository(ExclusionDates),
      dataSource.getRepository(HistoricalMonthlyMean),
      dataSource.getRepository(User),
      dataSource.getRepository(Sources),
      dataSource.getRepository(LatestData),
      dataSource.getRepository(TimeSeries),
      dataSource.getRepository(ScheduledUpdate),
      dataSource.getRepository(ReefCheckSurvey),
      dataSource,
    );
    const moduleFixture = await Test.createTestingModule({
      controllers: [SitesController],
      providers: [
        { provide: SitesService, useValue: service },
        {
          provide: getRepositoryToken(Site),
          useValue: dataSource.getRepository(Site),
        },
      ],
    }).compile();
    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new GlobalValidationPipe({ transform: true }));
    await app.init();
  });

  afterAll(async () => {
    if (app) await app.close();
    if (dataSource?.isInitialized) {
      await dataSource.query(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`);
      await dataSource.destroy();
    }
  });

  it('selects the latest eligible snapshot per visible site using the UTC calendar date', async () => {
    const { body } = await request(app.getHttpServer())
      .get('/api/sites?date=2024-03-15')
      .expect(200);
    expect(new Set(body.map((site: Site) => site.id))).toEqual(
      new Set([1, 2, 3, 4, 6]),
    );
    expect(body.find((site: Site) => site.id === 1)).toMatchObject({
      collectionData: { dhw: 2, satelliteTemperature: 15, tempWeeklyAlert: 2 },
      historicalDataDate: '2024-03-15',
    });
    expect(body.find((site: Site) => site.id === 2)).toMatchObject({
      collectionData: { satelliteTemperature: 25 },
      historicalDataDate: '2024-03-15',
    });
    expect(body.find((site: Site) => site.id === 6)).toMatchObject({
      collectionData: { satelliteTemperature: 66 },
      historicalDataDate: '2024-03-15',
    });
  });

  it.each([
    [1, 15],
    [2, 25],
    [6, 66],
  ])(
    'keeps site %i detail isolated through the last microsecond',
    async (id, temperature) => {
      const { body } = await request(app.getHttpServer())
        .get(`/api/sites/${id}?date=2024-03-15`)
        .expect(200);
      expect(body.collectionData.satelliteTemperature).toBe(temperature);
      expect(body.historicalDataDate).toBe('2024-03-15');
    },
  );

  it('keeps sparse snapshots dated and never substitutes live metrics for no data', async () => {
    const { body } = await request(app.getHttpServer())
      .get('/api/sites?date=2024-03-15')
      .expect(200);
    expect(body.find((site: Site) => site.id === 3)).toMatchObject({
      collectionData: {},
      historicalDataDate: '2024-01-01',
    });
    expect(body.find((site: Site) => site.id === 4).collectionData).toEqual({});
    const noData = await request(app.getHttpServer())
      .get('/api/sites/4?date=2024-03-15')
      .expect(200);
    expect(noData.body.collectionData).toEqual({});
    expect(noData.body.historicalDataDate).toBeUndefined();
    const beforeFirst = await request(app.getHttpServer())
      .get('/api/sites/3?date=2023-12-31')
      .expect(200);
    expect(beforeFirst.body.collectionData).toEqual({});
    expect(beforeFirst.body.historicalDataDate).toBeUndefined();
    const latest = await request(app.getHttpServer())
      .get('/api/sites/1')
      .expect(200);
    expect(latest.body.collectionData.satelliteTemperature).toBe(777);
  });

  it.each([
    '2999-01-01',
    '2024-02-30',
    '2024-13-01',
    '2024-03-15T12:00:00Z',
    "2024-03-15' OR 1=1--",
    '',
    'null',
    '2024-3-15',
  ])(
    'rejects invalid date %j at list and detail HTTP boundaries',
    async (value) => {
      await request(app.getHttpServer())
        .get(`/api/sites?date=${encodeURIComponent(value)}`)
        .expect(400);
      await request(app.getHttpServer())
        .get(`/api/sites/1?date=${encodeURIComponent(value)}`)
        .expect(400);
    },
  );

  it('accepts leap dates, no matches, missing sites, and rejects duplicate date values', async () => {
    await request(app.getHttpServer())
      .get('/api/sites?date=2024-02-29')
      .expect(200);
    const noMatches = await request(app.getHttpServer())
      .get('/api/sites?date=2024-03-15&name=absent')
      .expect(200);
    expect(noMatches.body).toEqual([]);
    await request(app.getHttpServer())
      .get('/api/sites/999?date=2024-03-15')
      .expect(404);
    await request(app.getHttpServer())
      .get('/api/sites?date=2024-03-15&date=2024-03-16')
      .expect(400);
  });
});
