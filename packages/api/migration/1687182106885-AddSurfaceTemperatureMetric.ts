import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSurfaceTemperatureMetric1687182106885 implements MigrationInterface {
  name = 'AddSurfaceTemperatureMetric1687182106885';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // wrapping migration with DROP and CREATE of the materialized view.
    await queryRunner.query(
      `DELETE FROM "typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "schema" = $3`,
      ['MATERIALIZED_VIEW', 'latest_data', 'public'],
    );
    await queryRunner.query(`DROP MATERIALIZED VIEW IF EXISTS "latest_data"`);

    await queryRunner.query(
      `ALTER TABLE "time_series" DROP CONSTRAINT "no_duplicate_data"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."time_series_metric_enum" RENAME TO "time_series_metric_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."time_series_metric_enum" AS ENUM('temp_alert', 'temp_weekly_alert', 'dhw', 'satellite_temperature', 'air_temperature', 'top_temperature', 'bottom_temperature', 'sst_anomaly', 'surface_temperature', 'significant_wave_height', 'wave_mean_period', 'wave_peak_period', 'wave_mean_direction', 'wind_speed', 'wind_direction', 'barometric_pressure_top', 'barometric_pressure_top_diff', 'barometric_pressure_bottom', 'cholorophyll_rfu', 'cholorophyll_concentration', 'conductivity', 'water_depth', 'odo_saturation', 'odo_concentration', 'salinity', 'specific_conductance', 'tds', 'turbidity', 'total_suspended_solids', 'sonde_wiper_position', 'ph', 'ph_mv', 'sonde_battery_voltage', 'sonde_cable_power_voltage', 'pressure', 'precipitation', 'rh', 'wind_gust_speed', 'nitrogen_total', 'phosphorus_total', 'phosphorus', 'silicate', 'nitrate_plus_nitrite', 'ammonium')`,
    );
    await queryRunner.query(
      `ALTER TABLE "time_series" ALTER COLUMN "metric" TYPE "public"."time_series_metric_enum" USING "metric"::"text"::"public"."time_series_metric_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."time_series_metric_enum_old"`);
    await queryRunner.query(
      `ALTER TABLE "time_series" ADD CONSTRAINT "no_duplicate_data" UNIQUE ("metric", "source_id", "timestamp")`,
    );

    // wrapping migration with DROP and CREATE of the materialized view.
    await queryRunner.query(
      `CREATE MATERIALIZED VIEW "latest_data" AS SELECT DISTINCT ON (metric, type, site_id, survey_point_id) "time_series"."id", metric, timestamp, value, type AS "source", site_id, survey_point_id FROM "time_series" "time_series" INNER JOIN "sources" "sources" ON "sources"."id" = "time_series"."source_id" WHERE timestamp >= current_date - INTERVAL '7 days' OR type IN ('sonde') AND (timestamp >= current_date - INTERVAL '90 days') ORDER BY metric, type, site_id, survey_point_id, timestamp DESC`,
    );
    await queryRunner.query(
      `INSERT INTO "typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES (DEFAULT, $1, DEFAULT, $2, $3, $4)`,
      [
        'public',
        'MATERIALIZED_VIEW',
        'latest_data',
        'SELECT DISTINCT ON (metric, type, site_id, survey_point_id) "time_series"."id", metric, timestamp, value, type AS "source", site_id, survey_point_id FROM "time_series" "time_series" INNER JOIN "sources" "sources" ON "sources"."id" = "time_series"."source_id" WHERE timestamp >= current_date - INTERVAL \'7 days\' OR type IN (\'sonde\') AND (timestamp >= current_date - INTERVAL \'90 days\') ORDER BY metric, type, site_id, survey_point_id, timestamp DESC',
      ],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // wrapping migration with DROP and CREATE of the materialized view.
    await queryRunner.query(
      `DELETE FROM "typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "schema" = $3`,
      ['MATERIALIZED_VIEW', 'latest_data', 'public'],
    );
    await queryRunner.query(`DROP MATERIALIZED VIEW IF EXISTS "latest_data"`);

    await queryRunner.query(
      `ALTER TABLE "time_series" DROP CONSTRAINT "no_duplicate_data"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."time_series_metric_enum_old" AS ENUM('air_temperature', 'ammonium', 'barometric_pressure_bottom', 'barometric_pressure_top', 'barometric_pressure_top_diff', 'bottom_temperature', 'cholorophyll_concentration', 'cholorophyll_rfu', 'conductivity', 'dhw', 'nitrate_plus_nitrite', 'nitrogen_total', 'odo_concentration', 'odo_saturation', 'ph', 'ph_mv', 'phosphorus', 'phosphorus_total', 'precipitation', 'pressure', 'rh', 'salinity', 'satellite_temperature', 'significant_wave_height', 'silicate', 'sonde_battery_voltage', 'sonde_cable_power_voltage', 'sonde_wiper_position', 'specific_conductance', 'sst_anomaly', 'tds', 'temp_alert', 'temp_weekly_alert', 'top_temperature', 'total_suspended_solids', 'turbidity', 'water_depth', 'wave_mean_direction', 'wave_mean_period', 'wave_peak_period', 'wind_direction', 'wind_gust_speed', 'wind_speed')`,
    );
    await queryRunner.query(
      `ALTER TABLE "time_series" ALTER COLUMN "metric" TYPE "public"."time_series_metric_enum_old" USING "metric"::"text"::"public"."time_series_metric_enum_old"`,
    );
    await queryRunner.query(`DROP TYPE "public"."time_series_metric_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."time_series_metric_enum_old" RENAME TO "time_series_metric_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "time_series" ADD CONSTRAINT "no_duplicate_data" UNIQUE ("timestamp", "metric", "source_id")`,
    );

    // wrapping migration with DROP and CREATE of the materialized view.
    await queryRunner.query(
      `CREATE MATERIALIZED VIEW "latest_data" AS SELECT DISTINCT ON (metric, type, site_id, survey_point_id) "time_series"."id", metric, timestamp, value, type AS "source", site_id, survey_point_id FROM "time_series" "time_series" INNER JOIN "sources" "sources" ON "sources"."id" = "time_series"."source_id" WHERE timestamp >= current_date - INTERVAL '7 days' OR type IN ('sonde') AND (timestamp >= current_date - INTERVAL '90 days') ORDER BY metric, type, site_id, survey_point_id, timestamp DESC`,
    );
    await queryRunner.query(
      `INSERT INTO "typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES (DEFAULT, $1, DEFAULT, $2, $3, $4)`,
      [
        'public',
        'MATERIALIZED_VIEW',
        'latest_data',
        'SELECT DISTINCT ON (metric, type, site_id, survey_point_id) "time_series"."id", metric, timestamp, value, type AS "source", site_id, survey_point_id FROM "time_series" "time_series" INNER JOIN "sources" "sources" ON "sources"."id" = "time_series"."source_id" WHERE timestamp >= current_date - INTERVAL \'7 days\' OR type IN (\'sonde\') AND (timestamp >= current_date - INTERVAL \'90 days\') ORDER BY metric, type, site_id, survey_point_id, timestamp DESC',
      ],
    );
  }
}
