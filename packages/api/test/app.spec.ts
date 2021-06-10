import { INestApplication } from '@nestjs/common';
import { healthCheckTests } from '../src/health-check/health-check.spec';
import { TestService } from './test.service';
import { cleanUpApp } from './utils';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  const testService = TestService.getInstance();

  beforeAll(async () => {
    app = await testService.getApp();
  });

  describe('HealthCheck (e2e)', healthCheckTests);

  afterAll(async () => {
    await cleanUpApp(app);
  });
});
