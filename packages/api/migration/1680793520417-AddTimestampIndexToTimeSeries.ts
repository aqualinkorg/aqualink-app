import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTimestampIndexToTimeSeries1680793520417 implements MigrationInterface {
  name = 'AddTimestampIndexToTimeSeries1680793520417';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX "IDX_50ce87d671efea12c27fae36eb" ON "time_series" ("timestamp") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_50ce87d671efea12c27fae36eb"`,
    );
  }
}
