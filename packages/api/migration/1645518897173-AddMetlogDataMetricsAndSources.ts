import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateMetricEnum1645518897173 implements MigrationInterface {
  name = 'UpdateMetricEnum1645518897173';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Temporarily drop materialized view
    await queryRunner.query(`DROP MATERIALIZED VIEW "latest_data"`);

    // Edit metrics enum
    await queryRunner.query(
      `ALTER TYPE "public"."metrics_metric_enum" RENAME TO "metrics_metric_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."metrics_metric_enum" AS ENUM('temp_alert', 'temp_weekly_alert', 'dhw', 'air_temperature', 'satellite_temperature', 'top_temperature', 'bottom_temperature', 'sst_anomaly', 'significant_wave_height', 'wave_mean_period', 'wave_peak_period', 'wave_mean_direction', 'wind_speed', 'wind_direction', 'cholorophyll_rfu', 'cholorophyll_concentration', 'conductivity', 'water_depth', 'odo_saturation', 'odo_concentration', 'salinity', 'specific_conductance', 'tds', 'turbidity', 'total_suspended_solids', 'sonde_wiper_position', 'ph', 'ph_mv', 'sonde_battery_voltage', 'sonde_cable_power_voltage', 'pressure', 'precipitation', 'rh', 'wind_gust_speed')`,
    );
    await queryRunner.query(
      `ALTER TABLE "metrics" ALTER COLUMN "metric" TYPE "public"."metrics_metric_enum" USING "metric"::"text"::"public"."metrics_metric_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "time_series" ALTER COLUMN "metric" TYPE "public"."metrics_metric_enum" USING "metric"::"text"::"public"."metrics_metric_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."metrics_metric_enum_old"`);

    // Edit sources enum
    await queryRunner.query(
      `ALTER TYPE "public"."sources_type_enum" ADD VALUE 'metlog'`,
    );
    await queryRunner.query(
      `ALTER TABLE "data_uploads" ALTER COLUMN "sensor_type" TYPE "public"."sources_type_enum" USING "sensor_type"::"text"::"public"."sources_type_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sources" ALTER COLUMN "type" TYPE "public"."sources_type_enum" USING "type"::"text"::"public"."sources_type_enum"`,
    );

    // Restore materialized view
    await queryRunner.query(`
            CREATE MATERIALIZED VIEW "latest_data" AS
            SELECT DISTINCT ON (metric, type, site_id, survey_point_id)
                "time_series"."id",
                metric,
                timestamp,
                value,
                type AS "source",
                site_id,
                survey_point_id
            FROM "time_series" "time_series"
            INNER JOIN "sources" "sources" ON "sources"."id" = "time_series"."source_id"
            ORDER BY metric, type, site_id, survey_point_id, timestamp DESC`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Temporarily drop materialized view
    await queryRunner.query(`DROP MATERIALIZED VIEW "latest_data"`);

    // Edit metrics enum
    await queryRunner.query(
      `CREATE TYPE "public"."metrics_metric_enum_old" AS ENUM('bottom_temperature', 'cholorophyll_concentration', 'cholorophyll_rfu', 'conductivity', 'dhw', 'odo_concentration', 'odo_saturation', 'ph', 'ph_mv', 'salinity', 'satellite_temperature', 'significant_wave_height', 'sonde_battery_voltage', 'sonde_cable_power_voltage', 'sonde_wiper_position', 'specific_conductance', 'sst_anomaly', 'tds', 'temp_alert', 'temp_weekly_alert', 'top_temperature', 'total_suspended_solids', 'turbidity', 'water_depth', 'wave_mean_direction', 'wave_mean_period', 'wave_peak_period', 'wind_direction', 'wind_speed')`,
    );
    await queryRunner.query(
      `ALTER TABLE "time_series" ALTER COLUMN "metric" TYPE "public"."metrics_metric_enum_old" USING "metric"::"text"::"public"."metrics_metric_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "metrics" ALTER COLUMN "metric" TYPE "public"."metrics_metric_enum_old" USING "metric"::"text"::"public"."metrics_metric_enum_old"`,
    );
    await queryRunner.query(`DROP TYPE "public"."metrics_metric_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."metrics_metric_enum_old" RENAME TO "metrics_metric_enum"`,
    );

    // Edit sources enum
    await queryRunner.query(
      `CREATE TYPE "public"."sources_type_enum_old" AS ENUM('spotter', 'hobo', 'noaa', 'gfs', 'sonde')`,
    );
    await queryRunner.query(
      `ALTER TABLE "sources" ALTER COLUMN "type" TYPE "public"."sources_type_enum_old" USING "type"::"text"::"public"."sources_type_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "data_uploads" ALTER COLUMN "sensor_type" TYPE "public"."sources_type_enum_old" USING "sensor_type"::"text"::"public"."sources_type_enum_old"`,
    );
    await queryRunner.query(`DROP TYPE "public"."sources_type_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."sources_type_enum_old" RENAME TO "sources_type_enum"`,
    );

    // Restore materialized view
    await queryRunner.query(`
            CREATE MATERIALIZED VIEW "latest_data" AS
            SELECT DISTINCT ON (metric, type, site_id, survey_point_id)
                "time_series"."id",
                metric,
                timestamp,
                value,
                type AS "source",
                site_id,
                survey_point_id
            FROM "time_series" "time_series"
            INNER JOIN "sources" "sources" ON "sources"."id" = "time_series"."source_id"
            ORDER BY metric, type, site_id, survey_point_id, timestamp DESC`);
  }
}
