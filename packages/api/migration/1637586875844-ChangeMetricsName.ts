/* eslint-disable prettier/prettier */
import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeMetricsName1637586875844 implements MigrationInterface {
    name = 'ChangeMetricsName1637586875844'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP MATERIALIZED VIEW "latest_data";`);
        // Add new sonde type
        await queryRunner.query(`ALTER TYPE sources_type_enum ADD VALUE IF NOT EXISTS 'sonde'`);
        // Add new sonde metrics
        await queryRunner.query(`ALTER TYPE metrics_metric_enum RENAME VALUE 'alert' TO 'temp_alert'`);
        await queryRunner.query(`ALTER TYPE metrics_metric_enum RENAME VALUE 'weekly_alert' TO 'temp_weekly_alert'`);
        await queryRunner.query(`ALTER TYPE "public"."metrics_metric_enum" RENAME TO "metrics_metric_enum_old"`);
        await queryRunner.query(`CREATE TYPE "metrics_metric_enum" AS ENUM('temp_alert', 'temp_weekly_alert', 'dhw', 'satellite_temperature', 'top_temperature', 'bottom_temperature', 'sst_anomaly', 'significant_wave_height', 'wave_mean_period', 'wave_peak_period', 'wave_mean_direction', 'wind_speed', 'wind_direction', 'cholorophyll_rfu', 'cholorophyll_concentration', 'conductivity', 'water_depth', 'odo_saturation', 'odo_concentration', 'salinity', 'specific_conductance', 'tds', 'turbidity', 'total_suspended_solids', 'sonde_wiper_position', 'ph', 'ph_mv', 'sonde_battery_voltage', 'sonde_cable_power_voltage')`);
        await queryRunner.query(`ALTER TABLE "metrics" ALTER COLUMN "metric" TYPE "metrics_metric_enum" USING "metric"::"text"::"metrics_metric_enum"`);
        await queryRunner.query(`ALTER TABLE "time_series" ALTER COLUMN "metric" TYPE "metrics_metric_enum" USING "metric"::"text"::"metrics_metric_enum"`);
        await queryRunner.query(`DROP TYPE "metrics_metric_enum_old"`);
        // Load existing metrics enum values into our metrics table
        await queryRunner.query(`ALTER TABLE "metrics" ALTER COLUMN "description" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "metrics" ALTER COLUMN "units" DROP NOT NULL`);
        await queryRunner.query(`INSERT INTO metrics(metric) SELECT unnest(enum_range(NULL::metrics_metric_enum)) as metric ON CONFLICT DO NOTHING`);
        // Reload materialized view
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
        await queryRunner.query(`DROP MATERIALIZED VIEW "latest_data";`);
        await queryRunner.query(`ALTER TABLE "metrics" ALTER COLUMN "units" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "metrics" ALTER COLUMN "description" SET NOT NULL`);
        await queryRunner.query(`ALTER TYPE metrics_metric_enum RENAME VALUE 'temp_alert' TO 'alert'`);
        await queryRunner.query(`ALTER TYPE metrics_metric_enum RENAME VALUE 'temp_weekly_alert' TO 'weekly_alert'`);
        await queryRunner.query(`ALTER TYPE "public"."metrics_metric_enum" RENAME TO "metrics_metric_enum_old"`);
        await queryRunner.query(`CREATE TYPE "metrics_metric_enum" AS ENUM('alert', 'weekly_alert', 'dhw', 'satellite_temperature', 'top_temperature', 'bottom_temperature', 'sst_anomaly', 'significant_wave_height', 'wave_mean_period', 'wave_peak_period', 'wave_mean_direction', 'wind_speed', 'wind_direction')`);
        // Drop incompatible metric rows
        await queryRunner.query(`DELETE FROM metrics WHERE metric::text IN ('cholorophyll_rfu', 'cholorophyll_concentration', 'conductivity', 'water_depth', 'odo_saturation', 'odo_concentration', 'salinity', 'specific_conductance', 'tds', 'turbidity', 'total_suspended_solids', 'sonde_wiper_position', 'ph', 'ph_mv', 'sonde_battery_voltage', 'sonde_cable_power_voltage')`);
        await queryRunner.query(`ALTER TABLE "metrics" ALTER COLUMN "metric" TYPE "metrics_metric_enum" USING "metric"::"text"::"metrics_metric_enum"`);
        await queryRunner.query(`ALTER TABLE "time_series" ALTER COLUMN "metric" TYPE "metrics_metric_enum" USING "metric"::"text"::"metrics_metric_enum"`);
        await queryRunner.query(`DROP TYPE "metrics_metric_enum_old"`);
        // Drop sonde sources
        await queryRunner.query(`ALTER TYPE "public"."sources_type_enum" RENAME TO "sources_type_enum_old"`);
        await queryRunner.query(`CREATE TYPE "sources_type_enum" AS ENUM('spotter', 'hobo', 'noaa', 'gfs')`);
        await queryRunner.query(`DELETE FROM sources WHERE type::text IN ('sonde')`);
        await queryRunner.query(`ALTER TABLE "sources" ALTER COLUMN "type" TYPE "sources_type_enum" USING "type"::"text"::"sources_type_enum"`);
        await queryRunner.query(`DROP TYPE "sources_type_enum_old"`);
        // recreate materialized view
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
