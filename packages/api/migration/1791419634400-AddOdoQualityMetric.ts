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
    // latest_data is materialized, so deleted rows stay visible until refresh.
    await queryRunner.query(`REFRESH MATERIALIZED VIEW "latest_data"`);
    // odo_quality stays in time_series_metric_enum. Postgres cannot drop a
    // single enum label without rebuilding the type and its dependents.
    // Rollback is intentionally partial, same as AddSeapHOxMetrics.
  }
}
