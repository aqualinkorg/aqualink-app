import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddExtraConstraintOnTimeSeries1615290662268 implements MigrationInterface {
  name = 'AddExtraConstraintOnTimeSeries1615290662268';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "time_series" ADD CONSTRAINT "no_duplicate_reef_data" UNIQUE ("timestamp", "reef_id", "metric", "source_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "time_series" DROP CONSTRAINT "no_duplicate_reef_data"`,
    );
  }
}
