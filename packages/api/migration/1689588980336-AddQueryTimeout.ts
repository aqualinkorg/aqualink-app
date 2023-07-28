import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddQueryTimeout1689588980336 implements MigrationInterface {
  name = 'AddQueryTimeout1689588980336';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('SET statement_timeout = 60000;');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('SET statement_timeout = 0;');
  }
}
