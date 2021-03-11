import { MigrationInterface, QueryRunner } from 'typeorm';

export class AppendNewMetrics1615469917998 implements MigrationInterface {
  name = 'AppendNewMetrics1615469917998';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."metrics_metric_enum" ADD VALUE 'significant_wave_height'`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."metrics_metric_enum" ADD VALUE 'wave_peak_period'`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."metrics_metric_enum" ADD VALUE 'wave_mean_direction'`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."metrics_metric_enum" ADD VALUE 'wind_speed'`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."metrics_metric_enum" ADD VALUE 'wind_direction'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "metrics" WHERE "metric" IN ('significant_wave_height', 'wave_peak_period', 'wave_mean_direction', 'wind_speed', 'wind_direction')`,
    );
    await queryRunner.query(
      `DELETE FROM "time_series" WHERE "metric" IN ('significant_wave_height', 'wave_peak_period', 'wave_mean_direction', 'wind_speed', 'wind_direction')`,
    );

    await queryRunner.query(
      `CREATE TYPE "metrics_metric_enum_old" AS ENUM('alert', 'dhw', 'satellite_temperature', 'surface_temperature', 'bottom_temperature', 'sst_anomaly')`,
    );

    await queryRunner.query(`DROP VIEW "latest_data"`);
    await queryRunner.query(
      `ALTER TABLE "time_series" DROP CONSTRAINT "no_duplicate_data"`,
    );
    await queryRunner.query(
      `ALTER TABLE "time_series" DROP CONSTRAINT "no_duplicate_reef_data"`,
    );

    await queryRunner.query(
      `ALTER TABLE "time_series" ALTER COLUMN "metric" TYPE "metrics_metric_enum_old" USING "metric"::"text"::"metrics_metric_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "metrics" ALTER COLUMN "metric" TYPE "metrics_metric_enum_old" USING "metric"::"text"::"metrics_metric_enum_old"`,
    );
    await queryRunner.query(`DROP TYPE "metrics_metric_enum"`);
    await queryRunner.query(
      `ALTER TYPE "metrics_metric_enum_old" RENAME TO  "metrics_metric_enum"`,
    );

    await queryRunner.query(
      `ALTER TABLE "time_series" ADD CONSTRAINT "no_duplicate_data" UNIQUE ("timestamp", "reef_id", "poi_id", "metric", "source_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "time_series" ADD CONSTRAINT "no_duplicate_reef_data" UNIQUE ("timestamp", "reef_id", "metric", "source_id")`,
    );
    await queryRunner.query(
      `CREATE VIEW "latest_data" AS
        SELECT
          DISTINCT ON (metric, source_id, time_series.reef_id, time_series.poi_id) "metric",
          "time_series"."id" AS "id",
          "source"."type" AS "source",
          timestamp,
          value,
          "time_series"."reef_id" AS "reef_id",
          "time_series"."poi_id" AS "poi_id"
        FROM "time_series" "time_series"
        INNER JOIN "sources" "source" ON "source"."id" = source_id
        ORDER BY reef_id, poi_id, metric, source_id, timestamp DESC`,
    );
  }
}
