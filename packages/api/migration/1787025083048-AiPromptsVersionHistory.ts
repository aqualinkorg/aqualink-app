import { MigrationInterface, QueryRunner } from "typeorm";

export class AiPromptsVersionHistory1787025083048 implements MigrationInterface {
    name = 'AiPromptsVersionHistory1787025083048'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "ai_prompts" DROP CONSTRAINT "fk_updated_by"`);
        await queryRunner.query(`ALTER TABLE "ai_prompts_history" DROP CONSTRAINT "fk_changed_by"`);
        await queryRunner.query(`ALTER TABLE "ai_prompts_history" DROP CONSTRAINT "fk_prompt"`);
        await queryRunner.query(`ALTER TABLE "ai_chat_logs" DROP CONSTRAINT "fk_site"`);
        await queryRunner.query(`ALTER TABLE "ai_chat_logs" DROP CONSTRAINT "fk_user"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_sources_site_id_type"`);
        await queryRunner.query(`DROP INDEX "public"."time_series_source_id_timestamp_idx"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_time_series_source_metric_timestamp"`);
        await queryRunner.query(`DROP INDEX "public"."idx_ai_prompts_prompt_key"`);
        await queryRunner.query(`DROP INDEX "public"."idx_ai_prompts_is_active"`);
        await queryRunner.query(`DROP INDEX "public"."idx_ai_prompts_history_prompt_id"`);
        await queryRunner.query(`DROP INDEX "public"."idx_ai_chat_logs_site_id"`);
        await queryRunner.query(`DROP INDEX "public"."idx_ai_chat_logs_created_at"`);
        await queryRunner.query(`DROP INDEX "public"."idx_ai_chat_logs_user_id"`);
        await queryRunner.query(`ALTER TABLE "site" DROP COLUMN "nearest_sofar_wave_location"`);
        await queryRunner.query(`ALTER TABLE "site" DROP COLUMN "nearest_sofar_wind_location"`);
        await queryRunner.query(`ALTER TABLE "site" ALTER COLUMN "has_seaphox" SET DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "forecast_data" DROP CONSTRAINT "one_row_per_site_per_metric_per_source"`);
        await queryRunner.query(`ALTER TYPE "public"."forecast_data_metric_enum" RENAME TO "forecast_data_metric_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."forecast_data_metric_enum" AS ENUM('significant_wave_height', 'SIGNIFICANT_WAVE_HEIGHT', 'wave_mean_direction', 'WAVE_MEAN_DIRECTION', 'wave_mean_period', 'WAVE_MEAN_PERIOD', 'wind_speed', 'WIND_SPEED', 'wind_direction', 'WIND_DIRECTION')`);
        await queryRunner.query(`ALTER TABLE "forecast_data" ALTER COLUMN "metric" TYPE "public"."forecast_data_metric_enum" USING "metric"::"text"::"public"."forecast_data_metric_enum"`);
        await queryRunner.query(`DROP TYPE "public"."forecast_data_metric_enum_old"`);
        await queryRunner.query(`ALTER TYPE "public"."forecast_data_source_enum" RENAME TO "forecast_data_source_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."forecast_data_source_enum" AS ENUM('gfs', 'hobo', 'noaa', 'spotter', 'sonde', 'metlog', 'sofar_model', 'hui', 'hwo', 'sheet_data', 'seaphox', 'open_meteo')`);
        await queryRunner.query(`ALTER TABLE "forecast_data" ALTER COLUMN "source" TYPE "public"."forecast_data_source_enum" USING "source"::"text"::"public"."forecast_data_source_enum"`);
        await queryRunner.query(`DROP TYPE "public"."forecast_data_source_enum_old"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_time_series_metric_source_timestamp_DESC"`);
        await queryRunner.query(`ALTER TABLE "time_series" DROP CONSTRAINT "no_duplicate_data"`);
        await queryRunner.query(`ALTER TYPE "public"."time_series_metric_enum" RENAME TO "time_series_metric_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."time_series_metric_enum" AS ENUM('temp_alert', 'temp_weekly_alert', 'dhw', 'satellite_temperature', 'air_temperature', 'top_temperature', 'bottom_temperature', 'sst_anomaly', 'surface_temperature', 'significant_wave_height', 'wave_mean_period', 'wave_peak_period', 'wave_mean_direction', 'wind_speed', 'wind_direction', 'barometric_pressure_top', 'barometric_pressure_top_diff', 'barometric_pressure_bottom', 'cholorophyll_rfu', 'cholorophyll_concentration', 'conductivity', 'water_depth', 'odo_saturation', 'odo_concentration', 'salinity', 'specific_conductance', 'tds', 'turbidity', 'total_suspended_solids', 'sonde_wiper_position', 'ph', 'ph_mv', 'sonde_battery_voltage', 'sonde_cable_power_voltage', 'pressure', 'precipitation', 'rh', 'wind_gust_speed', 'nitrogen_total', 'phosphorus_total', 'phosphorus', 'silicate', 'nitrate_plus_nitrite', 'ammonium', 'enterococcus', 'turbidity_1', 'turbidity_2', 'turbidity_3', 'turbidity_4', 'dissolved_oxygen', 'internal_ph', 'external_ph_volt', 'internal_ph_volt', 'ph_temperature', 'internal_temperature', 'relative_humidity')`);
        await queryRunner.query(`ALTER TABLE "time_series" ALTER COLUMN "metric" TYPE "public"."time_series_metric_enum" USING "metric"::"text"::"public"."time_series_metric_enum"`);
        await queryRunner.query(`DROP TYPE "public"."time_series_metric_enum_old"`);
        await queryRunner.query(`ALTER TABLE "ai_prompts" DROP CONSTRAINT "ai_prompts_prompt_key_key"`);
        await queryRunner.query(`ALTER TABLE "ai_prompts" DROP COLUMN "prompt_key"`);
        await queryRunner.query(`ALTER TABLE "ai_prompts" ADD "prompt_key" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "ai_prompts" ADD CONSTRAINT "UQ_4319c3c06ff4f5e56fcc3f2b6fc" UNIQUE ("prompt_key")`);
        await queryRunner.query(`ALTER TABLE "ai_prompts_history" DROP COLUMN "prompt_key"`);
        await queryRunner.query(`ALTER TABLE "ai_prompts_history" ADD "prompt_key" character varying NOT NULL`);
        await queryRunner.query(`CREATE INDEX "IDX_37c32d8374025e483c2dd3f69c" ON "ai_chat_logs" ("site_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_aa621c948d6ebe8a0161b68cd4" ON "ai_chat_logs" ("user_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_16f74f4fa45da0179cfe8b6ec3" ON "ai_chat_logs" ("site_id", "created_at") `);
        await queryRunner.query(`ALTER TABLE "forecast_data" ADD CONSTRAINT "one_row_per_site_per_metric_per_source" UNIQUE ("site_id", "metric", "source")`);
        await queryRunner.query(`ALTER TABLE "time_series" ADD CONSTRAINT "no_duplicate_data" UNIQUE ("metric", "source_id", "timestamp")`);
        await queryRunner.query(`ALTER TABLE "ai_prompts" ADD CONSTRAINT "FK_7fc42d8da870a1e2d01799fca5c" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ai_prompts_history" ADD CONSTRAINT "FK_b5cb04e52a00ee4bfc59a739385" FOREIGN KEY ("prompt_id") REFERENCES "ai_prompts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ai_prompts_history" ADD CONSTRAINT "FK_8cf79970955490bb70f9eac1d5a" FOREIGN KEY ("changed_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ai_chat_logs" ADD CONSTRAINT "FK_37c32d8374025e483c2dd3f69c6" FOREIGN KEY ("site_id") REFERENCES "site"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ai_chat_logs" ADD CONSTRAINT "FK_aa621c948d6ebe8a0161b68cd41" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "ai_chat_logs" DROP CONSTRAINT "FK_aa621c948d6ebe8a0161b68cd41"`);
        await queryRunner.query(`ALTER TABLE "ai_chat_logs" DROP CONSTRAINT "FK_37c32d8374025e483c2dd3f69c6"`);
        await queryRunner.query(`ALTER TABLE "ai_prompts_history" DROP CONSTRAINT "FK_8cf79970955490bb70f9eac1d5a"`);
        await queryRunner.query(`ALTER TABLE "ai_prompts_history" DROP CONSTRAINT "FK_b5cb04e52a00ee4bfc59a739385"`);
        await queryRunner.query(`ALTER TABLE "ai_prompts" DROP CONSTRAINT "FK_7fc42d8da870a1e2d01799fca5c"`);
        await queryRunner.query(`ALTER TABLE "time_series" DROP CONSTRAINT "no_duplicate_data"`);
        await queryRunner.query(`ALTER TABLE "forecast_data" DROP CONSTRAINT "one_row_per_site_per_metric_per_source"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_16f74f4fa45da0179cfe8b6ec3"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_aa621c948d6ebe8a0161b68cd4"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_37c32d8374025e483c2dd3f69c"`);
        await queryRunner.query(`ALTER TABLE "ai_prompts_history" DROP COLUMN "prompt_key"`);
        await queryRunner.query(`ALTER TABLE "ai_prompts_history" ADD "prompt_key" character varying(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "ai_prompts" DROP CONSTRAINT "UQ_4319c3c06ff4f5e56fcc3f2b6fc"`);
        await queryRunner.query(`ALTER TABLE "ai_prompts" DROP COLUMN "prompt_key"`);
        await queryRunner.query(`ALTER TABLE "ai_prompts" ADD "prompt_key" character varying(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "ai_prompts" ADD CONSTRAINT "ai_prompts_prompt_key_key" UNIQUE ("prompt_key")`);
        await queryRunner.query(`CREATE TYPE "public"."time_series_metric_enum_old" AS ENUM('air_temperature', 'ammonium', 'barometric_pressure_bottom', 'barometric_pressure_top', 'barometric_pressure_top_diff', 'bottom_temperature', 'cholorophyll_concentration', 'cholorophyll_rfu', 'conductivity', 'dhw', 'dissolved_oxygen', 'enterococcus', 'error_flags', 'external_ph_volt', 'internal_ph', 'internal_ph_volt', 'internal_temperature', 'nitrate_plus_nitrite', 'nitrogen_total', 'odo_concentration', 'odo_saturation', 'ph', 'ph_mv', 'ph_temperature', 'phosphorus', 'phosphorus_total', 'precipitation', 'pressure', 'relative_humidity', 'rh', 'salinity', 'sample_number', 'satellite_temperature', 'seaphox_conductivity', 'seaphox_error_flags', 'seaphox_external_ph', 'seaphox_external_ph_volt', 'seaphox_int_temperature', 'seaphox_internal_ph', 'seaphox_internal_ph_volt', 'seaphox_oxygen', 'seaphox_ph_temperature', 'seaphox_pressure', 'seaphox_relative_humidity', 'seaphox_salinity', 'seaphox_sample_number', 'seaphox_temperature', 'significant_wave_height', 'silicate', 'sonde_battery_voltage', 'sonde_cable_power_voltage', 'sonde_wiper_position', 'specific_conductance', 'sst_anomaly', 'surface_temperature', 'tds', 'temp_alert', 'temp_weekly_alert', 'top_temperature', 'total_suspended_solids', 'turbidity', 'turbidity_1', 'turbidity_2', 'turbidity_3', 'turbidity_4', 'water_depth', 'wave_mean_direction', 'wave_mean_period', 'wave_peak_period', 'wind_direction', 'wind_gust_speed', 'wind_speed')`);
        await queryRunner.query(`ALTER TABLE "time_series" ALTER COLUMN "metric" TYPE "public"."time_series_metric_enum_old" USING "metric"::"text"::"public"."time_series_metric_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."time_series_metric_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."time_series_metric_enum_old" RENAME TO "time_series_metric_enum"`);
        await queryRunner.query(`ALTER TABLE "time_series" ADD CONSTRAINT "no_duplicate_data" UNIQUE ("timestamp", "metric", "source_id")`);
        await queryRunner.query(`CREATE INDEX "IDX_time_series_metric_source_timestamp_DESC" ON "time_series" ("timestamp", "metric", "source_id") `);
        await queryRunner.query(`CREATE TYPE "public"."forecast_data_source_enum_old" AS ENUM('gfs', 'hobo', 'hui', 'metlog', 'noaa', 'open_meteo', 'sheet_data', 'sofar_model', 'sonde', 'spotter')`);
        await queryRunner.query(`ALTER TABLE "forecast_data" ALTER COLUMN "source" TYPE "public"."forecast_data_source_enum_old" USING "source"::"text"::"public"."forecast_data_source_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."forecast_data_source_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."forecast_data_source_enum_old" RENAME TO "forecast_data_source_enum"`);
        await queryRunner.query(`CREATE TYPE "public"."forecast_data_metric_enum_old" AS ENUM('significant_wave_height', 'wave_mean_direction', 'wave_mean_period', 'wind_direction', 'wind_speed')`);
        await queryRunner.query(`ALTER TABLE "forecast_data" ALTER COLUMN "metric" TYPE "public"."forecast_data_metric_enum_old" USING "metric"::"text"::"public"."forecast_data_metric_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."forecast_data_metric_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."forecast_data_metric_enum_old" RENAME TO "forecast_data_metric_enum"`);
        await queryRunner.query(`ALTER TABLE "forecast_data" ADD CONSTRAINT "one_row_per_site_per_metric_per_source" UNIQUE ("metric", "site_id", "source")`);
        await queryRunner.query(`ALTER TABLE "site" ALTER COLUMN "has_seaphox" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "site" ADD "nearest_sofar_wind_location" geometry(GEOMETRY,0)`);
        await queryRunner.query(`ALTER TABLE "site" ADD "nearest_sofar_wave_location" geometry(GEOMETRY,0)`);
        await queryRunner.query(`CREATE INDEX "idx_ai_chat_logs_user_id" ON "ai_chat_logs" ("user_id") `);
        await queryRunner.query(`CREATE INDEX "idx_ai_chat_logs_created_at" ON "ai_chat_logs" ("created_at") `);
        await queryRunner.query(`CREATE INDEX "idx_ai_chat_logs_site_id" ON "ai_chat_logs" ("site_id") `);
        await queryRunner.query(`CREATE INDEX "idx_ai_prompts_history_prompt_id" ON "ai_prompts_history" ("prompt_id") `);
        await queryRunner.query(`CREATE INDEX "idx_ai_prompts_is_active" ON "ai_prompts" ("is_active") `);
        await queryRunner.query(`CREATE INDEX "idx_ai_prompts_prompt_key" ON "ai_prompts" ("prompt_key") `);
        await queryRunner.query(`CREATE INDEX "IDX_time_series_source_metric_timestamp" ON "time_series" ("timestamp", "metric", "source_id") `);
        await queryRunner.query(`CREATE INDEX "time_series_source_id_timestamp_idx" ON "time_series" ("timestamp", "source_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_sources_site_id_type" ON "sources" ("type", "site_id") `);
        await queryRunner.query(`ALTER TABLE "ai_chat_logs" ADD CONSTRAINT "fk_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ai_chat_logs" ADD CONSTRAINT "fk_site" FOREIGN KEY ("site_id") REFERENCES "site"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ai_prompts_history" ADD CONSTRAINT "fk_prompt" FOREIGN KEY ("prompt_id") REFERENCES "ai_prompts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ai_prompts_history" ADD CONSTRAINT "fk_changed_by" FOREIGN KEY ("changed_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ai_prompts" ADD CONSTRAINT "fk_updated_by" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

}
