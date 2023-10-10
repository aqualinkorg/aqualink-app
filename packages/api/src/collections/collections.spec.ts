import { INestApplication } from '@nestjs/common';
import _, { maxBy, omit, sortBy } from 'lodash';
import request from 'supertest';
import { DeepPartial } from 'typeorm';
import {
  adminCollectionMock,
  defaultCollectionMock,
} from '../../test/mock/collection.mock';
import {
  athensSite,
  californiaSite,
  floridaSite,
} from '../../test/mock/site.mock';
import {
  athensTimeSeries,
  californiaTimeSeries,
  floridaTimeSeries,
} from '../../test/mock/time-series.mock';
import {
  adminFirebaseUserMock,
  adminUserMock,
  defaultFirebaseUserMock,
  siteManagerFirebaseUserMock,
  siteManagerUserMock,
} from '../../test/mock/user.mock';
import { TestService } from '../../test/test.service';
import { mockExtractAndVerifyToken } from '../../test/utils';
import { Metric } from '../time-series/metrics.enum';
import { TimeSeries } from '../time-series/time-series.entity';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';

const collectionDtoToEntity = (dto: CreateCollectionDto) => ({
  name: dto.name,
  isPublic: dto.isPublic,
  user: { id: dto.userId },
  sites: dto.siteIds.map((siteId) => ({ id: siteId })),
});

const getLatestData = (data: DeepPartial<TimeSeries>[]) =>
  _(data)
    .groupBy((o) => _.camelCase(o.metric))
    .mapValues((o) => maxBy(o, (obj) => obj.timestamp)?.value)
    .toJSON();

export const collectionTests = () => {
  const testService = TestService.getInstance();
  let app: INestApplication;
  let createdCollectionId: number;
  let updateCollectionDto: UpdateCollectionDto;
  let createCollectionDto: CreateCollectionDto;

  beforeAll(async () => {
    app = await testService.getApp();
    createCollectionDto = {
      name: 'Test Dashboard',
      isPublic: true,
      userId: siteManagerUserMock.id || 0,
      siteIds: [floridaSite.id || 0, californiaSite.id || 0],
    };
    updateCollectionDto = {
      name: 'Updated Collection',
      isPublic: false,
      removeSiteIds: [floridaSite.id || 0],
    };
  });

  describe('Test main collection flow', () => {
    it('POST / creates a new collection', async () => {
      mockExtractAndVerifyToken(adminFirebaseUserMock);

      const rsp = await request(app.getHttpServer())
        .post('/collections/')
        .send(createCollectionDto);

      expect(rsp.status).toBe(201);
      expect(rsp.body).toMatchObject(
        collectionDtoToEntity(createCollectionDto),
      );
      createdCollectionId = rsp.body.id;
    });

    it("GET / fetch all admin user's collections (no filters)", async () => {
      mockExtractAndVerifyToken(siteManagerFirebaseUserMock);

      const rsp = await request(app.getHttpServer()).get('/collections/');

      expect(rsp.status).toBe(200);
      expect(rsp.body.length).toBe(1);
      const sortedRsp = sortBy(rsp.body, (o) => o.createdAt);
      expect(sortedRsp[0]).toMatchObject({
        name: createCollectionDto.name,
        isPublic: createCollectionDto.isPublic,
      });
    });

    it('GET / filter collections by name', async () => {
      mockExtractAndVerifyToken(siteManagerFirebaseUserMock);
      const rsp = await request(app.getHttpServer())
        .get('/collections/')
        .query({ name: createCollectionDto.name });

      expect(rsp.status).toBe(200);
      expect(rsp.body.length).toBe(1);
      expect(rsp.body[0]).toMatchObject({
        name: createCollectionDto.name,
        isPublic: createCollectionDto.isPublic,
      });
    });

    it('GET / filter collections by siteId', async () => {
      mockExtractAndVerifyToken(siteManagerFirebaseUserMock);
      const rsp = await request(app.getHttpServer())
        .get('/collections/')
        .query({ siteId: floridaSite.id });

      expect(rsp.status).toBe(200);
      expect(rsp.body.length).toBe(1);
    });

    it('PUT /:id update the test collection', async () => {
      mockExtractAndVerifyToken(siteManagerFirebaseUserMock);
      const rsp = await request(app.getHttpServer())
        .put(`/collections/${createdCollectionId}`)
        .send(updateCollectionDto);

      expect(rsp.status).toBe(200);
      expect(rsp.body.name).toBe(updateCollectionDto.name);
      expect(rsp.body.isPublic).toBe(updateCollectionDto.isPublic);
      expect(rsp.body.siteIds.length).toBe(1);
      expect(rsp.body.siteIds[0]).toBe(californiaSite.id);

      mockExtractAndVerifyToken(siteManagerFirebaseUserMock);
      const rsp2 = await request(app.getHttpServer())
        .put(`/collections/${createdCollectionId}`)
        .send({
          addSiteIds: [floridaSite || 0],
        });

      expect(rsp2.status).toBe(200);
      expect(rsp2.body.siteIds.length).toBe(2);
    });

    it('GET /public filter public collections', async () => {
      const rsp = await request(app.getHttpServer()).get('/collections/public');

      expect(rsp.status).toBe(200);
      // Only admin collection is public now
      expect(rsp.body.length).toBe(1);
    });

    it('GET /:id fetch collection details', async () => {
      mockExtractAndVerifyToken(siteManagerFirebaseUserMock);
      const rsp = await request(app.getHttpServer()).get(
        `/collections/${createdCollectionId}`,
      );

      expect(rsp.status).toBe(200);
      expect(rsp.body.user).toMatchObject(
        omit(
          siteManagerUserMock,
          'adminLevel',
          'firebaseUid',
          'createdAt',
          'updatedAt',
        ),
      );
      expect(rsp.body.userId).toBe(siteManagerUserMock.id);
      expect(rsp.body.name).toBe(updateCollectionDto.name);
      expect(rsp.body.isPublic).toBe(updateCollectionDto.isPublic);
      expect(rsp.body.sites.length).toBe(2);
      const sortedSites = sortBy(rsp.body.sites, (o) => o.name);
      expect(sortedSites[0]).toMatchObject(
        omit(
          californiaSite,
          'applied',
          'createdAt',
          'updatedAt',
          'spotterApiToken',
        ),
      );
      expect(sortedSites[1]).toMatchObject(
        omit(
          floridaSite,
          'applied',
          'createdAt',
          'updatedAt',
          'spotterApiToken',
        ),
      );

      const floridaLatestData = getLatestData(floridaTimeSeries);
      const californiaLatestData = getLatestData(californiaTimeSeries);

      expect(sortedSites[0].collectionData).toStrictEqual(californiaLatestData);
      expect(sortedSites[1].collectionData).toStrictEqual(floridaLatestData);
    });

    it('PUT /:id change the owner of the collection', async () => {
      mockExtractAndVerifyToken(siteManagerFirebaseUserMock);
      const rsp = await request(app.getHttpServer())
        .put(`/collections/${createdCollectionId}`)
        .send({ userId: adminUserMock.id });

      expect(rsp.status).toBe(200);
    });

    it('DELETE /:id delete created test collection', async () => {
      mockExtractAndVerifyToken(adminFirebaseUserMock);
      const rsp = await request(app.getHttpServer()).delete(
        `/collections/${createdCollectionId}`,
      );

      expect(rsp.status).toBe(200);
    });
  });

  it('GET /public/:id fetch details from a public collection', async () => {
    const rsp = await request(app.getHttpServer()).get(
      `/collections/public/${adminCollectionMock.id}`,
    );

    expect(rsp.status).toBe(200);
    expect(rsp.body.user).toMatchObject(
      omit(adminUserMock, 'firebaseUid', 'createdAt', 'updatedAt'),
    );
    expect(rsp.body.userId).toBe(adminUserMock.id);
    expect(rsp.body.name).toBe(adminCollectionMock.name);
    expect(rsp.body.isPublic).toBe(adminCollectionMock.isPublic);
    expect(rsp.body.sites.length).toBe(adminCollectionMock.sites?.length);

    const sortedSites = sortBy(rsp.body.sites, (o) => o.name);
    expect(sortedSites[0]).toMatchObject(
      omit(athensSite, 'applied', 'createdAt', 'updatedAt', 'spotterApiToken'),
    );
    expect(sortedSites[1]).toMatchObject(
      omit(
        californiaSite,
        'applied',
        'createdAt',
        'updatedAt',
        'spotterApiToken',
      ),
    );
    expect(sortedSites[2]).toMatchObject(
      omit(floridaSite, 'applied', 'createdAt', 'updatedAt', 'spotterApiToken'),
    );

    const athensLatestData = getLatestData(athensTimeSeries);
    const californiaLatestData = getLatestData(californiaTimeSeries);
    const floridaLatestData = getLatestData(floridaTimeSeries);

    expect(sortedSites[0].collectionData).toStrictEqual(
      // Omit top and bottom temperature since hobo data are not included in collection data
      omit(
        athensLatestData,
        _.camelCase(Metric.TOP_TEMPERATURE),
        _.camelCase(Metric.BOTTOM_TEMPERATURE),
      ),
    );
    expect(sortedSites[1].collectionData).toStrictEqual(californiaLatestData);
    expect(sortedSites[2].collectionData).toStrictEqual(floridaLatestData);
  });

  it('GET /:id access a collection that does not belong to you', async () => {
    mockExtractAndVerifyToken(siteManagerFirebaseUserMock);
    const rsp = await request(app.getHttpServer()).get(
      `/collections/${adminCollectionMock.id}`,
    );

    expect(rsp.status).toBe(403);
  });

  it('GET /:id access a collection with no sites', async () => {
    mockExtractAndVerifyToken(defaultFirebaseUserMock);
    const rsp = await request(app.getHttpServer()).get(
      `/collections/${defaultCollectionMock.id}`,
    );

    expect(rsp.status).toBe(200);
    expect(rsp.body.sites.length).toBe(0);
  });

  it('GET /public/:id access a non-public collection', async () => {
    const rsp = await request(app.getHttpServer()).get(
      `/collections/public/${defaultCollectionMock.id}`,
    );

    expect(rsp.status).toBe(403);
  });

  it('GET /public/:id fetch collection that does not exists', async () => {
    const rsp = await request(app.getHttpServer()).get(`/collections/public/0`);

    expect(rsp.status).toBe(404);
  });

  it('GET /heat-stress-tracker get heat stress collection', async () => {
    const rsp = await request(app.getHttpServer()).get(
      '/collections/heat-stress-tracker',
    );

    expect(rsp.status).toBe(200);
  });
};
