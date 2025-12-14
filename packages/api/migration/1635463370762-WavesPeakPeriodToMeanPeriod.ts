import { MigrationInterface, QueryRunner } from 'typeorm';

export class WavesPeakPeriodToMeanPeriod1635463370762 implements MigrationInterface {
  name = 'WavesPeakPeriodToMeanPeriod1635463370762';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP MATERIALIZED VIEW "latest_data";`);
    // Move wave columns in daily table and create new wave_mean_period.
    await queryRunner.query(
      `ALTER TABLE "daily_data" RENAME COLUMN "wave_direction" TO "wave_mean_direction";`,
    );
    await queryRunner.query(
      `ALTER TABLE "daily_data" RENAME COLUMN "wave_period" TO "wave_peak_period";`,
    );
    await queryRunner.query(
      `ALTER TABLE "daily_data" ADD "wave_mean_period" integer`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."metrics_metric_enum" ADD VALUE 'wave_mean_period'`,
    );
    // Use the same metric enum in timeseries
    await queryRunner.query(
      `ALTER TABLE "time_series" ALTER COLUMN "metric" TYPE "metrics_metric_enum" USING "metric"::"text"::"metrics_metric_enum"`,
    );
    await queryRunner.query(`DROP TYPE "time_series_metric_enum"`);
    await queryRunner.query(
      `CREATE MATERIALIZED VIEW "latest_data" AS
              SELECT 
              "time_series".id,
              "time_series".metric,
              "time_series".timestamp,
              "time_series".value,
              "source"."type" AS "source",
              "source"."site_id" AS "site_id",
              "source"."survey_point_id" AS "survey_point_id"
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
    await queryRunner.query(`DROP MATERIALIZED VIEW "latest_data"`);
    await queryRunner.query(
      `CREATE TYPE "time_series_metric_enum_old" AS ENUM('alert', 'weekly_alert', 'dhw', 'satellite_temperature', 'top_temperature', 'bottom_temperature', 'sst_anomaly', 'significant_wave_height', 'wave_peak_period', 'wave_mean_direction', 'wind_speed', 'wind_direction')`,
    );
    await queryRunner.query(
      `ALTER TABLE "time_series" ALTER COLUMN "metric" TYPE "time_series_metric_enum_old" USING "metric"::"text"::"time_series_metric_enum_old"`,
    );
    await queryRunner.query(`DROP TYPE IF EXISTS "time_series_metric_enum"`);
    await queryRunner.query(
      `ALTER TYPE "time_series_metric_enum_old" RENAME TO  "time_series_metric_enum"`,
    );
    await queryRunner.query(
      `CREATE TYPE "metrics_metric_enum_old" AS ENUM('alert', 'weekly_alert', 'dhw', 'satellite_temperature', 'top_temperature', 'bottom_temperature', 'sst_anomaly', 'significant_wave_height', 'wave_peak_period', 'wave_mean_direction', 'wind_speed', 'wind_direction')`,
    );
    await queryRunner.query(
      `ALTER TABLE "metrics" ALTER COLUMN "metric" TYPE "metrics_metric_enum_old" USING "metric"::"text"::"metrics_metric_enum_old"`,
    );
    await queryRunner.query(`DROP TYPE "metrics_metric_enum"`);
    await queryRunner.query(
      `ALTER TYPE "metrics_metric_enum_old" RENAME TO  "metrics_metric_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "daily_data" DROP COLUMN "wave_mean_period"`,
    );
    await queryRunner.query(
      `ALTER TABLE "daily_data" RENAME COLUMN "wave_peak_period" TO "wave_period"`,
    );
    await queryRunner.query(
      `ALTER TABLE "daily_data" RENAME COLUMN "wave_mean_directiom" TO "wave_direction"`,
    );
    await queryRunner.query(
      `ALTER TABLE "daily_data" DROP COLUMN "wave_mean_direction"`,
    );
    await queryRunner.query(
      `CREATE MATERIALIZED VIEW "latest_data" AS
              SELECT 
              "time_series".id,
              "time_series".metric,
              "time_series".timestamp,
              "time_series".value,
              "source"."type" AS "source",
              "source"."site_id" AS "site_id",
              "source"."survey_point_id" AS "survey_point_id"
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
