import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakeTimeSeriesSourceNotNull1689848494071 implements MigrationInterface {
  name = 'MakeTimeSeriesSourceNotNull1689848494071';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // lock time_series so we can safely execute DDL operations
    await queryRunner.query('LOCK TABLE time_series IN ACCESS EXCLUSIVE MODE');

    // delete rows with null source_id, since they are meaningless for the app.
    await queryRunner.query('delete from time_series where source_id is null');

    await queryRunner.query(
      `ALTER TABLE "time_series" DROP CONSTRAINT "FK_fb5d7b75a674607b65fa78d5c92"`,
    );
    await queryRunner.query(
      `ALTER TABLE "time_series" DROP CONSTRAINT "no_duplicate_data"`,
    );
    await queryRunner.query(
      `ALTER TABLE "time_series" ALTER COLUMN "source_id" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "time_series" ADD CONSTRAINT "no_duplicate_data" UNIQUE ("metric", "source_id", "timestamp")`,
    );
    await queryRunner.query(
      `ALTER TABLE "time_series" ADD CONSTRAINT "FK_fb5d7b75a674607b65fa78d5c92" FOREIGN KEY ("source_id") REFERENCES "sources"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "time_series" DROP CONSTRAINT "FK_fb5d7b75a674607b65fa78d5c92"`,
    );
    await queryRunner.query(
      `ALTER TABLE "time_series" DROP CONSTRAINT "no_duplicate_data"`,
    );
    await queryRunner.query(
      `ALTER TABLE "time_series" ALTER COLUMN "source_id" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "time_series" ADD CONSTRAINT "no_duplicate_data" UNIQUE ("timestamp", "metric", "source_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "time_series" ADD CONSTRAINT "FK_fb5d7b75a674607b65fa78d5c92" FOREIGN KEY ("source_id") REFERENCES "sources"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }
}
