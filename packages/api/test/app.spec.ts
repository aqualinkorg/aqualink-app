import { INestApplication } from '@nestjs/common';
import { TestService } from './test.service';
import { healthCheckTests } from '../src/health-check/health-check.spec';
import { userTests } from '../src/users/users.spec';
import { collectionTests } from '../src/collections/collections.spec';

describe('AppController (e2e)', () => {
  const testService = TestService.getInstance();
  let app: INestApplication;

  beforeAll(async () => {
    // Initialize app
    app = await testService.getApp();
  });

  it('App is defined', () => {
    expect(app).toBeDefined();
  });

  describe('HealthCheck (e2e) /health-check', healthCheckTests);

  describe('User (e2e) /users', userTests);

  describe('Collection (e2e) /collections', collectionTests);

  afterAll(async () => {
    await testService.cleanUpApp();
  });
});
