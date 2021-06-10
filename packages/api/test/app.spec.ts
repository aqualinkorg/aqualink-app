import { TestService } from './test.service';
import { healthCheckTests } from '../src/health-check/health-check.spec';
import { userTests } from '../src/users/users.spec';

describe('AppController (e2e)', () => {
  const testService = TestService.getInstance();

  describe('HealthCheck (e2e)', healthCheckTests);

  describe('User (e2e)', userTests);

  afterAll(async () => {
    await testService.cleanUpApp();
  });
});
