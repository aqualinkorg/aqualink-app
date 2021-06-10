import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { TestService } from '../../test/test.service';

export const healthCheckTests = () => {
  let app: INestApplication;
  const testService = TestService.getInstance();

  beforeAll(async () => {
    app = await testService.getApp();
  });

  it('GET /health-check', () => {
    return request(app.getHttpServer())
      .get('/health-check')
      .expect(200)
      .expect({ status: 200 });
  });
};
