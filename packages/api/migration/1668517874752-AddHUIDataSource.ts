import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddHUIDataSource1668517874752 implements MigrationInterface {
  name = 'AddHUIDataSource1668517874752';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "forecast_data" ALTER COLUMN "source" DROP DEFAULT`,
    );

    await queryRunner.query(
      `ALTER TABLE "data_uploads" ALTER COLUMN "site_id" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "data_uploads" ALTER COLUMN "survey_point_id" DROP NOT NULL`,
    );

    await queryRunner.query(
      `ALTER TYPE "public"."sources_type_enum" ADD VALUE IF NOT EXISTS 'hui'`,
    );

    await queryRunner.query(
      `ALTER TYPE "public"."metrics_metric_enum" ADD VALUE IF NOT EXISTS 'nitrogen_total'`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."metrics_metric_enum" ADD VALUE IF NOT EXISTS 'phosphorus_total'`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."metrics_metric_enum" ADD VALUE IF NOT EXISTS 'phosphorus'`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."metrics_metric_enum" ADD VALUE IF NOT EXISTS 'silicate'`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."metrics_metric_enum" ADD VALUE IF NOT EXISTS 'nitrate_plus_nitrite'`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."metrics_metric_enum" ADD VALUE IF NOT EXISTS 'ammonium'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "data_uploads" ALTER COLUMN "survey_point_id" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "data_uploads" ALTER COLUMN "site_id" SET NOT NULL`,
    );

    await queryRunner.query(`DROP MATERIALIZED VIEW "latest_data"`);

    await queryRunner.query(
      `CREATE TYPE "public"."metrics_metric_enum_old" AS ENUM('air_temperature', 'barometric_pressure_bottom', 'barometric_pressure_top', 'barometric_pressure_top_diff', 'bottom_temperature', 'cholorophyll_concentration', 'cholorophyll_rfu', 'conductivity', 'dhw', 'odo_concentration', 'odo_saturation', 'ph', 'ph_mv', 'precipitation', 'pressure', 'rh', 'salinity', 'satellite_temperature', 'significant_wave_height', 'sonde_battery_voltage', 'sonde_cable_power_voltage', 'sonde_wiper_position', 'specific_conductance', 'sst_anomaly', 'tds', 'temp_alert', 'temp_weekly_alert', 'top_temperature', 'total_suspended_solids', 'turbidity', 'water_depth', 'wave_mean_direction', 'wave_mean_period', 'wave_peak_period', 'wind_direction', 'wind_gust_speed', 'wind_speed')`,
    );
    await queryRunner.query(
      `ALTER TABLE "metrics" ALTER COLUMN "metric" TYPE "public"."metrics_metric_enum_old" USING "metric"::"text"::"public"."metrics_metric_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "time_series" ALTER COLUMN "metric" TYPE "public"."metrics_metric_enum_old" USING "metric"::"text"::"public"."metrics_metric_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "forecast_data" ALTER COLUMN "metric" TYPE "public"."metrics_metric_enum_old" USING "metric"::"text"::"public"."metrics_metric_enum_old"`,
    );
    await queryRunner.query(`DROP TYPE "public"."metrics_metric_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."metrics_metric_enum_old" RENAME TO "metrics_metric_enum"`,
    );

    await queryRunner.query(
      `CREATE TYPE "public"."sources_type_enum_old" AS ENUM('gfs', 'hobo', 'metlog', 'noaa', 'sofar_wave_model', 'sonde', 'spotter')`,
    );
    await queryRunner.query(
      `ALTER TABLE "forecast_data" ALTER COLUMN "source" TYPE "public"."sources_type_enum_old" USING "source"::"text"::"public"."sources_type_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sources" ALTER COLUMN "type" TYPE "public"."sources_type_enum_old" USING "type"::"text"::"public"."sources_type_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "data_uploads" ALTER COLUMN "sensor_type" TYPE "public"."sources_type_enum_old" USING "sensor_type"::"text"::"public"."sources_type_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sources" ALTER COLUMN "type" TYPE "public"."sources_type_enum_old" USING "type"::"text"::"public"."sources_type_enum_old"`,
    );
    await queryRunner.query(`DROP TYPE "public"."sources_type_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."sources_type_enum_old" RENAME TO "sources_type_enum"`,
    );

    await queryRunner.query(
      `ALTER TABLE "forecast_data" ALTER COLUMN "source" SET DEFAULT 'sofar_wave_model'`,
    );

    await queryRunner.query(
      `CREATE MATERIALIZED VIEW "latest_data"
                AS SELECT
                    DISTINCT ON (metric, type, site_id, survey_point_id)
                    "time_series"."id", metric, timestamp, value, type AS "source", site_id, survey_point_id
                FROM "time_series" "time_series"
                INNER JOIN "sources" "sources" ON "sources"."id" = "time_series"."source_id"
                WHERE timestamp >= current_date - INTERVAL '7 days'
                OR type = 'sonde' AND (timestamp >= current_date - INTERVAL '90 days')
                ORDER BY metric, type, site_id, survey_point_id, timestamp DESC`,
    );
  }
}
