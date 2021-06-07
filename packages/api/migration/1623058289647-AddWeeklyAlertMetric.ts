import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddWeeklyAlertMetric1623058289647 implements MigrationInterface {
  name = 'AddWeeklyAlertMetric1623058289647';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP MATERIALIZED VIEW latest_data`);
    await queryRunner.query(
      `ALTER TYPE "public"."metrics_metric_enum" RENAME TO "metrics_metric_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "metrics_metric_enum" AS ENUM('alert', 'weekly_alert', 'dhw', 'satellite_temperature', 'top_temperature', 'bottom_temperature', 'sst_anomaly', 'significant_wave_height', 'wave_peak_period', 'wave_mean_direction', 'wind_speed', 'wind_direction')`,
    );
    await queryRunner.query(
      `ALTER TABLE "metrics" ALTER COLUMN "metric" TYPE "metrics_metric_enum" USING "metric"::"text"::"metrics_metric_enum"`,
    );
    await queryRunner.query(`DROP TYPE "metrics_metric_enum_old"`);
    await queryRunner.query(`DROP INDEX "IDX_cb2f3e83c09f83e8ce007ffd6f"`);
    await queryRunner.query(
      `ALTER TABLE "time_series" DROP CONSTRAINT "no_duplicate_data"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."time_series_metric_enum" RENAME TO "time_series_metric_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "time_series_metric_enum" AS ENUM('alert', 'weekly_alert', 'dhw', 'satellite_temperature', 'top_temperature', 'bottom_temperature', 'sst_anomaly', 'significant_wave_height', 'wave_peak_period', 'wave_mean_direction', 'wind_speed', 'wind_direction')`,
    );
    await queryRunner.query(
      `ALTER TABLE "time_series" ALTER COLUMN "metric" TYPE "time_series_metric_enum" USING "metric"::"text"::"time_series_metric_enum"`,
    );
    await queryRunner.query(`DROP TYPE "time_series_metric_enum_old"`);
    await queryRunner.query(
      `CREATE INDEX "IDX_cb2f3e83c09f83e8ce007ffd6f" ON "time_series" ("metric", "source_id", "timestamp" DESC) `,
    );
    await queryRunner.query(
      `ALTER TABLE "time_series" ADD CONSTRAINT "no_duplicate_data" UNIQUE ("metric", "source_id", "timestamp")`,
    );
    await queryRunner.query(
      `CREATE MATERIALIZED VIEW "latest_data" AS
        SELECT 
        "time_series".id,
        "time_series".metric,
        "time_series".timestamp,
        "time_series".value,
        "source"."type" AS "source",
        "source"."reef_id" AS "reef_id",
        "source"."poi_id" AS "poi_id"
        FROM 
          (SELECT
            DISTINCT ON (metric, source_id) metric AS "metric",
            id,
            timestamp,
            value,
            source_id
          FROM "time_series" "time_series"
          ORDER BY metric, source_id, timestamp DESC) "time_series"
        INNER JOIN "sources" "source" ON "source"."id" = "time_series"."source_id"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP MATERIALIZED VIEW latest_data`);
    await queryRunner.query(
      `ALTER TABLE "time_series" DROP CONSTRAINT "no_duplicate_data"`,
    );
    await queryRunner.query(`DROP INDEX "IDX_cb2f3e83c09f83e8ce007ffd6f"`);
    await queryRunner.query(
      `DELETE FROM "time_series" WHERE "metric"='weekly_alert'`,
    );
    await queryRunner.query(
      `CREATE TYPE "time_series_metric_enum_old" AS ENUM('alert', 'dhw', 'satellite_temperature', 'top_temperature', 'bottom_temperature', 'sst_anomaly', 'significant_wave_height', 'wave_peak_period', 'wave_mean_direction', 'wind_speed', 'wind_direction')`,
    );
    await queryRunner.query(
      `ALTER TABLE "time_series" ALTER COLUMN "metric" TYPE "time_series_metric_enum_old" USING "metric"::"text"::"time_series_metric_enum_old"`,
    );
    await queryRunner.query(`DROP TYPE "time_series_metric_enum"`);
    await queryRunner.query(
      `ALTER TYPE "time_series_metric_enum_old" RENAME TO  "time_series_metric_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "time_series" ADD CONSTRAINT "no_duplicate_data" UNIQUE ("timestamp", "metric", "source_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_cb2f3e83c09f83e8ce007ffd6f" ON "time_series" ("metric", "source_id", "timestamp" DESC) `,
    );
    await queryRunner.query(
      `CREATE TYPE "metrics_metric_enum_old" AS ENUM('alert', 'dhw', 'satellite_temperature', 'top_temperature', 'bottom_temperature', 'sst_anomaly', 'significant_wave_height', 'wave_peak_period', 'wave_mean_direction', 'wind_speed', 'wind_direction')`,
    );
    await queryRunner.query(
      `ALTER TABLE "metrics" ALTER COLUMN "metric" TYPE "metrics_metric_enum_old" USING "metric"::"text"::"metrics_metric_enum_old"`,
    );
    await queryRunner.query(`DROP TYPE "metrics_metric_enum"`);
    await queryRunner.query(
      `ALTER TYPE "metrics_metric_enum_old" RENAME TO  "metrics_metric_enum"`,
    );
    await queryRunner.query(
      `CREATE MATERIALIZED VIEW "latest_data" AS
        SELECT 
        "time_series".id,
        "time_series".metric,
        "time_series".timestamp,
        "time_series".value,
        "source"."type" AS "source",
        "source"."reef_id" AS "reef_id",
        "source"."poi_id" AS "poi_id"
        FROM 
          (SELECT
            DISTINCT ON (metric, source_id) metric AS "metric",
            id,
            timestamp,
            value,
            source_id
          FROM "time_series" "time_series"
          ORDER BY metric, source_id, timestamp DESC) "time_series"
        INNER JOIN "sources" "source" ON "source"."id" = "time_series"."source_id"`,
    );
  }
}
