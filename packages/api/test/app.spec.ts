import { INestApplication } from '@nestjs/common';
import { TestService } from './test.service';
import { healthCheckTests } from '../src/health-check/health-check.spec';
import { userTests } from '../src/users/users.spec';
import { collectionTests } from '../src/collections/collections.spec';
import { timeSeriesTests } from '../src/time-series/time-series.spec';
import { regionTests } from '../src/regions/regions.spec';
import { surveyPointTests } from '../src/site-survey-points/site-survey-points.spec';
import { siteApplicationTests } from '../src/site-applications/site-application.spec';
import { surveyTests } from '../src/surveys/surveys.spec';
import { siteTests } from '../src/sites/sites.spec';
import { sensorTests } from '../src/sensors/sensors.spec';
import { monitoringTests } from '../src/monitoring/monitoring.spec';

describe('AppController (e2e)', () => {
  const testService = TestService.getInstance();
  let app: INestApplication;

  beforeAll(async () => {
    // Initialize app
    app = await testService.getApp();
  });

  it('timezone should always be UTC', () => {
    expect(new Date().getTimezoneOffset()).toBe(0);
  });

  it('App is defined', () => {
    expect(app).toBeDefined();
  });

  describe('HealthCheck (e2e) /health-check', healthCheckTests);

  describe('User (e2e) /users', userTests);

  describe('Site SurveyPoints (e2e) /site-survey-points', surveyPointTests);

  describe('Collection (e2e) /collections', collectionTests);

  describe('Time Series (e2e) /time-series', timeSeriesTests);

  describe('Region (e2e) /regions', regionTests);

  describe('Site Application {e2e) /site-applications', siteApplicationTests);

  describe('Survey (e2e) /sites/:id/surveys', surveyTests);

  describe('Sites (e2e) /sites', siteTests);

  describe('Sensors (e2e) /sensors', sensorTests);

  describe('Monitoring (e2e) /monitoring', monitoringTests);

  afterAll(async () => {
    await testService.cleanUpApp();
  });
});
