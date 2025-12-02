import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { join } from 'path';
import { DataSource } from 'typeorm';
import type { DataSourceOptions } from 'typeorm';
import 'dotenv/config';

// Use __dirname global for CommonJS compatibility (Jest/Node.js)
declare const __dirname: string;

// If we have a DATABASE_URL, use that
// If the node_env is set to test then use the TEST_DATABASE_URL instead.
// If no TEST_DATABASE_URL is defined then use the same connection as on development but use database TEST_POSTGRES_DATABASE
const isTestEnv = process.env.NODE_ENV === 'test';
const prefix = isTestEnv ? 'TEST_' : '';
const databaseUrl = process.env[`${prefix}DATABASE_URL`];
const dataSourceInfo = databaseUrl
  ? { url: databaseUrl }
  : {
      host: process.env.POSTGRES_HOST || 'localhost',
      port:
        (process.env.POSTGRES_PORT &&
          parseInt(process.env.POSTGRES_PORT, 10)) ||
        5432,
      database: process.env[`${prefix}POSTGRES_DATABASE`] || 'postgres',
      ...(process.env.POSTGRES_USER && {
        username: process.env.POSTGRES_USER,
      }),
      ...(process.env.POSTGRES_PASSWORD && {
        password: process.env.POSTGRES_PASSWORD,
      }),
    };

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  ...dataSourceInfo,
  // We don't want to auto-synchronize production data - we should deliberately run migrations.
  synchronize: false,
  logging: false,
  logger: 'advanced-console',
  namingStrategy: new SnakeNamingStrategy(),
  entities: [
    // Needed to get a TS context on entity imports.
    // See
    // https://stackoverflow.com/questions/59435293/typeorm-entity-in-nestjs-cannot-use-import-statement-outside-a-module
    join(__dirname, 'src/**', '*.entity.ts'),
    join(__dirname, 'src/**', '*.entity.js'),
  ],
  migrations: [join(__dirname, 'migration/**', '*.ts')],
};

export default new DataSource(dataSourceOptions);
