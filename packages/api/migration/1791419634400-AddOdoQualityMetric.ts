import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOdoQualityMetric1791419634400 implements MigrationInterface {
  name = 'AddOdoQualityMetric1791419634400';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."time_series_metric_enum" ADD VALUE IF NOT EXISTS 'odo_quality'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "time_series" WHERE "metric" = 'odo_quality'`,
    );
  }
}
