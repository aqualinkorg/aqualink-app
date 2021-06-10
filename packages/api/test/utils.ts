import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import {
  Connection,
  DeepPartial,
  EntityMetadata,
  ObjectLiteral,
  ObjectType,
} from 'typeorm';
import { AppModule } from '../src/app.module';

export const getNestApp = async () => {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();

  return app.init();
};

export const getConnection = (app: INestApplication) => {
  return app.get(Connection);
};

export const cleanUpConnection = (connection: Connection) => {
  return connection.close();
};

export const cleanUpApp = async (app: INestApplication) => {
  await app.close();
};

export const getEntities = (connection: Connection) => {
  return connection.entityMetadatas;
};

export const cleanAllEntities = (
  connection: Connection,
  entities: EntityMetadata[],
) => {
  return Promise.all(
    entities.map((entity) => {
      if (entity.tableType === 'view') {
        return null;
      }
      return connection.query(`DELETE FROM ${entity.tableName};`);
    }),
  );
};

export const loadMocks = (
  connection: Connection,
  mocks: [ObjectType<ObjectLiteral>, DeepPartial<ObjectType<ObjectLiteral>>][],
) => {
  return Promise.all(
    mocks.map(([Entity, entities]) => {
      const repository = connection.getRepository(Entity);
      return repository.save(entities);
    }),
  );
};
