import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Connection, EntityMetadata } from 'typeorm';
import mocks from './mock';
import { AppModule } from '../src/app.module';

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
    await this.cleanAllEntities(connection);
    await this.loadMocks(connection);
  }

  private loadMocks(connection: Connection) {
    return Promise.all(
      mocks.map(([Entity, entities]) => {
        const repository = connection.getRepository(Entity);
        return repository.save(entities);
      }),
    );
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
