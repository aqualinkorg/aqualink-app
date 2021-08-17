import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { omit } from 'lodash';
import { TestService } from '../../test/test.service';
import { athensReef, floridaReef } from '../../test/mock/reef.mock';
import { mockExtractAndVerifyToken } from '../../test/utils';
import {
  adminFirebaseUserMock,
  reefManagerFirebaseUserMock,
} from '../../test/mock/user.mock';
import { floridaReefApplication } from '../../test/mock/reef-application.mock';

export const reefApplicationTests = () => {
  const testService = TestService.getInstance();
  let app: INestApplication;
  let appId: string;

  beforeAll(async () => {
    app = await testService.getApp();
  });

  it('GET /reefs/:id fetches a reef application with reefId', async () => {
    mockExtractAndVerifyToken(reefManagerFirebaseUserMock);
    const rsp = await request(app.getHttpServer()).get(
      `/reef-applications/reefs/${floridaReef.id}`,
    );

    expect(rsp.status).toBe(200);
    expect(rsp.body).toMatchObject({
      ...omit(
        floridaReefApplication,
        'createdAt',
        'updatedAt',
        'user',
        'reef',
        'uid',
        'id',
      ),
    });
    expect(rsp.body.reef).toBeDefined();
    expect(rsp.body.user).toBeDefined();
    appId = rsp.body.appId;
  });

  it('GET /reefs/:id fetches a non-existing reef application', async () => {
    mockExtractAndVerifyToken(adminFirebaseUserMock);
    const rsp = await request(app.getHttpServer()).get(
      `/reef-applications/reefs/${athensReef.id}`,
    );

    expect(rsp.status).toBe(404);
  });

  it('PUT /:hashId/reefs/:id updates a reef application using reefId', async () => {
    const updatedReefApplicationFoundingSource = 'New found source';
    mockExtractAndVerifyToken(reefManagerFirebaseUserMock);
    const rsp = await request(app.getHttpServer())
      .put(`/reef-applications/${appId}/reefs/${floridaReef.id}`)
      .send({
        fundingSource: updatedReefApplicationFoundingSource,
      });

    expect(rsp.status).toBe(200);
    expect(rsp.body).toMatchObject({
      ...omit(
        floridaReefApplication,
        'createdAt',
        'updatedAt',
        'user',
        'reef',
        'uid',
        'id',
      ),
      fundingSource: updatedReefApplicationFoundingSource,
    });
  });

  it('GET /:id fetches a non-existing reef application with id', async () => {
    const rsp = await request(app.getHttpServer())
      .get(`/reef-applications/0a0`)
      .query({ uid: floridaReefApplication.uid });

    expect(rsp.status).toBe(404);
  });

  it('GET /:id fetches a reef application with invalid uid', async () => {
    const rsp = await request(app.getHttpServer())
      .get(`/reef-applications/${floridaReefApplication.id}`)
      .query({ uid: 'wrong' });

    expect(rsp.status).toBe(404);
  });
};
