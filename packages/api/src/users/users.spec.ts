import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Connection } from 'typeorm';
import { TestService } from '../../test/test.service';
import { createPoint } from '../utils/coordinates';
import { AdminLevel, User } from './users.entity';
import { adminUserMock } from '../../test/mock/user.mock';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';

jest.mock('../auth/firebase-auth.guard');

export const userTests = () => {
  const testService = TestService.getInstance();
  let app: INestApplication;
  let firebaseGuard: FirebaseAuthGuard;
  let connection: Connection;

  beforeAll(async () => {
    app = await testService.getApp();
    connection = await testService.getConnection();
    firebaseGuard = app.get(FirebaseAuthGuard);
  });

  it('Gets super admin details', async () => {
    const usersRepository = connection.getRepository(User);
    jest
      .spyOn(firebaseGuard, 'canActivate')
      .mockImplementationOnce(async (context) => {
        const user = await usersRepository.findOne({
          where: { firebaseUid: adminUserMock.firebaseUid },
        });

        const req = context.switchToHttp().getRequest();
        req.user = user;
        return true;
      });

    const rsp = await request(app.getHttpServer()).get('/users/current');

    expect(rsp.status).toBe(200);
    expect(rsp.body).not.toHaveProperty('firebaseUid');
    expect(rsp.body).toMatchObject({
      fullName: 'John Doe',
      email: 'johndoe@example.org',
      organization: 'John Foundations',
      location: createPoint(-113.00825255521971, 27.52775820686191),
      country: 'USA',
      adminLevel: AdminLevel.SuperAdmin,
      description: 'A test super admin user',
      imageUrl: 'http://some-sample-url.com',
    });
    expect(rsp.body).toHaveProperty('id');
    expect(rsp.body).toHaveProperty('createdAt');
    expect(rsp.body).toHaveProperty('updatedAt');
  });
};
