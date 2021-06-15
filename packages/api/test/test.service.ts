import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Connection, EntityMetadata } from 'typeorm';
import { AppModule } from '../src/app.module';
import { users } from './mock/user.mock';
import { User } from '../src/users/users.entity';
import { Reef } from '../src/reefs/reefs.entity';
import { reefs } from './mock/reef.mock';
import { ReefApplication } from '../src/reef-applications/reef-applications.entity';
import { reefApplications } from './mock/reef-application.mock';

export class TestService {
  private static instance: TestService | null = null;
  private app: INestApplication | null = null;

  private constructor() {}

  private async initializeApp() {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    this.app = moduleFixture.createNestApplication();

    this.app.init();

    const connection = this.app.get(Connection);
    // Clean up database
    await this.cleanAllEntities(connection);

    // Make sure database is up-to-date
    await connection.runMigrations({ transaction: 'each' });

    // Load mock entities
    await this.loadMocks(connection);
  }

  private async loadMocks(connection: Connection) {
    await connection.getRepository(User).save(users);
    await connection.getRepository(Reef).save(reefs);
    await connection.getRepository(ReefApplication).save(reefApplications);
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

  public async getConnection() {
    if (!this.app) {
      await this.initializeApp();
    }

    return this.app!.get(Connection);
  }

  public cleanUpApp() {
    if (!this.app) {
      return Promise.resolve();
    }

    return this.app.close();
  }

  public cleanAllEntities(connection: Connection) {
    const entities: EntityMetadata[] = connection.entityMetadatas;

    return Promise.all(
      entities.map((entity) => {
        if (entity.tableType === 'view') {
          return null;
        }
        return connection.query(`DELETE FROM ${entity.tableName};`);
      }),
    );
  }
}
