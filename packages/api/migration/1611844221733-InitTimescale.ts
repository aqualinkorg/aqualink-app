import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitTimescale1611844221733 implements MigrationInterface {
  name = 'InitTimescale1611844221733';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "timescaledb"');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP EXTENSION IF EXISTS "timescaledb"');
  }
}
