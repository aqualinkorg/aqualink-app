import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { omit } from 'lodash';
import { TestService } from '../../test/test.service';
import { athensSite, floridaSite } from '../../test/mock/site.mock';
import { mockExtractAndVerifyToken } from '../../test/utils';
import {
  adminFirebaseUserMock,
  siteManagerFirebaseUserMock,
} from '../../test/mock/user.mock';
import { floridaSiteApplication } from '../../test/mock/site-application.mock';

export const siteApplicationTests = () => {
  const testService = TestService.getInstance();
  let app: INestApplication;
  let appId: string;

  beforeAll(async () => {
    app = await testService.getApp();
  });

  it('GET /sites/:id fetches a site application with siteId', async () => {
    mockExtractAndVerifyToken(siteManagerFirebaseUserMock);
    const rsp = await request(app.getHttpServer()).get(
      `/site-applications/sites/${floridaSite.id}`,
    );

    expect(rsp.status).toBe(200);
    expect(rsp.body).toMatchObject({
      ...omit(
        floridaSiteApplication,
        'createdAt',
        'updatedAt',
        'user',
        'site',
        'uid',
        'id',
      ),
    });
    expect(rsp.body.site).toBeDefined();
    expect(rsp.body.user).toBeDefined();
    appId = rsp.body.appId;
  });

  it('GET /sites/:id fetches a non-existing site application', async () => {
    mockExtractAndVerifyToken(adminFirebaseUserMock);
    const rsp = await request(app.getHttpServer()).get(
      `/site-applications/sites/${athensSite.id}`,
    );

    expect(rsp.status).toBe(404);
  });

  it('PUT /:appId/sites/:id updates a site application using siteId', async () => {
    const updatedSiteApplicationFoundingSource = 'New found source';
    mockExtractAndVerifyToken(siteManagerFirebaseUserMock);
    const rsp = await request(app.getHttpServer())
      .put(`/site-applications/${appId}/sites/${floridaSite.id}`)
      .send({
        fundingSource: updatedSiteApplicationFoundingSource,
      });

    expect(rsp.status).toBe(200);
    expect(rsp.body).toMatchObject({
      ...omit(
        floridaSiteApplication,
        'createdAt',
        'updatedAt',
        'user',
        'site',
        'uid',
        'id',
      ),
      fundingSource: updatedSiteApplicationFoundingSource,
    });
  });

  it('GET /:id fetches a non-existing site application with id', async () => {
    const rsp = await request(app.getHttpServer())
      .get(`/site-applications/0a0`)
      .query({ uid: floridaSiteApplication.uid });

    expect(rsp.status).toBe(404);
  });

  it('GET /:id fetches a site application with invalid uid', async () => {
    const rsp = await request(app.getHttpServer())
      .get(`/site-applications/${floridaSiteApplication.id}`)
      .query({ uid: 'wrong' });

    expect(rsp.status).toBe(404);
  });
};
