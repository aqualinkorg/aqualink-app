import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { Point } from 'geojson';
import Bluebird from 'bluebird';
import { AppModule } from '../src/app.module';
import { User } from '../src/users/users.entity';
import { Site } from '../src/sites/sites.entity';
import { SiteSurveyPoint } from '../src/site-survey-points/site-survey-points.entity';
import { GlobalValidationPipe } from '../src/validations/global-validation.pipe';
import { SiteApplication } from '../src/site-applications/site-applications.entity';
import { Sources } from '../src/sites/sources.entity';
import { TimeSeries } from '../src/time-series/time-series.entity';
import { Collection } from '../src/collections/collections.entity';
import { DailyData } from '../src/sites/daily-data.entity';
import { Region } from '../src/regions/regions.entity';
import { Survey } from '../src/surveys/surveys.entity';
import { HistoricalMonthlyMean } from '../src/sites/historical-monthly-mean.entity';
import { SurveyMedia } from '../src/surveys/survey-media.entity';
import { ExclusionDates } from '../src/sites/exclusion-dates.entity';
import { getHistoricalMonthlyMeans } from '../src/utils/temperature';
import { users } from './mock/user.mock';
import { sites } from './mock/site.mock';
import { surveyPoints } from './mock/survey-point.mock';
import { siteApplications } from './mock/site-application.mock';
import { sources } from './mock/source.mock';
import { timeSeries } from './mock/time-series.mock';
import { collections } from './mock/collection.mock';
import { dailyData } from './mock/daily-data.mock';
import { surveys } from './mock/surveys.mock';
import { surveyMedia } from './mock/survey-media.mock';

export class TestService {
  private static instance: TestService | null = null;
  private app: INestApplication | null = null;

  private constructor() {}

  private async initializeApp() {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    this.app = moduleFixture.createNestApplication();

    await this.app.init();

    this.app.useGlobalPipes(
      new GlobalValidationPipe({
        transform: true,
        skipTransformIds: ['appId'],
      }),
    );

    const connection = this.app.get(DataSource);
    try {
      // Clean up database
      await this.cleanAllEntities(connection);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log('Clean up failed');
      throw err;
    }

    try {
      // Make sure database is up-to-date
      await connection.runMigrations({ transaction: 'each' });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log('Migrations failed to run');
      throw err;
    }

    try {
      // Load mock entities
      await this.loadMocks(connection);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log('Mocks failed to load');
      throw err;
    }
  }

  private async loadMocks(connection: DataSource) {
    await connection.getRepository(User).save(users);
    await connection.getRepository(Site).save(sites);
    await connection.getRepository(SiteSurveyPoint).save(surveyPoints);
    await connection.getRepository(SiteApplication).save(siteApplications);
    await connection.getRepository(Sources).save(sources);
    await connection.getRepository(TimeSeries).save(timeSeries);
    await connection.query('REFRESH MATERIALIZED VIEW latest_data');
    await connection.getRepository(Collection).save(collections);
    await connection.getRepository(DailyData).save(dailyData);
    await connection.getRepository(Survey).save(surveys);
    await connection.getRepository(SurveyMedia).save(surveyMedia);

    await Bluebird.map(sites, async (site) => {
      const [longitude, latitude] = (site.polygon as Point).coordinates;
      const historicalMonthlyMean = await getHistoricalMonthlyMeans(
        longitude,
        latitude,
      );

      return Bluebird.map(historicalMonthlyMean, (hmm) =>
        connection.getRepository(HistoricalMonthlyMean).save({
          site,
          month: hmm.month,
          temperature: hmm.temperature,
        }),
      );
    });
  }

  public static getInstance() {
    this.instance = this.instance || new TestService();
    return this.instance;
  }

  public async getApp() {
    if (!this.app) {
      await this.initializeApp();
    }

    return this.app!;
  }

  public async getDataSource() {
    if (!this.app) {
      await this.initializeApp();
    }

    return this.app!.get(DataSource);
  }

  public cleanUpApp() {
    if (!this.app) {
      return Promise.resolve();
    }

    return this.app.close();
  }

  public async cleanAllEntities(connection: DataSource) {
    await connection.getRepository(TimeSeries).delete({});
    await connection.getRepository(Sources).delete({});
    await connection.getRepository(Collection).delete({});
    await connection.getRepository(Region).delete({});
    await connection.getRepository(SiteApplication).delete({});
    await connection.getRepository(SiteSurveyPoint).delete({});
    await connection.getRepository(DailyData).delete({});
    await connection.getRepository(ExclusionDates).delete({});
    await connection.getRepository(Survey).delete({});
    await connection.getRepository(SurveyMedia).delete({});
    await connection.getRepository(HistoricalMonthlyMean).delete({});
    await connection.getRepository(Site).delete({});
    await connection.getRepository(User).delete({});
  }
}
