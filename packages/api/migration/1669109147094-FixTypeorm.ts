import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixTypeorm1669109147094 implements MigrationInterface {
  name = 'FixTypeorm1669109147094';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // wrapping migration with DROP and CREATE of the materialized view.
    await queryRunner.query(
      `DELETE FROM "typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "schema" = $3`,
      ['MATERIALIZED_VIEW', 'latest_data', 'public'],
    );
    await queryRunner.query(`DROP MATERIALIZED VIEW IF EXISTS "latest_data"`);

    // change: 1, use typeorm recommended uid default generation
    await queryRunner.query(
      `ALTER TABLE "site_application" ALTER COLUMN "uid" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "site_application" DROP CONSTRAINT "UQ_adfd79a75e1f1b576138711e9b5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "site_application" ALTER COLUMN "uid" TYPE uuid USING "uid"::uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "site_application" ALTER COLUMN "uid" SET DEFAULT uuid_generate_v4()`,
    );
    await queryRunner.query(
      `ALTER TABLE "site_application" ADD CONSTRAINT "UQ_5f257a9a881454e9b640ea4c303" UNIQUE ("uid")`,
    );
    await queryRunner.query(
      `ALTER TABLE "site_application" ALTER COLUMN "permit_requirements" TYPE character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "site_application" ALTER COLUMN "funding_source" TYPE character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "site_application" ALTER COLUMN "installation_resources" TYPE character varying`,
    );

    // change 2, create data_uploads_sensor_type_enum
    await queryRunner.query(
      `CREATE TYPE "public"."data_uploads_sensor_type_enum" AS ENUM('gfs', 'hobo', 'noaa', 'spotter', 'sonde', 'metlog', 'sofar_wave_model', 'hui')`,
    );
    await queryRunner.query(
      `ALTER TABLE "data_uploads" ALTER COLUMN "sensor_type" TYPE "public"."data_uploads_sensor_type_enum" USING "sensor_type"::"text"::"public"."data_uploads_sensor_type_enum"`,
    );

    // change 3, create forecast_data_metric_enum
    await queryRunner.query(
      `CREATE TYPE "public"."forecast_data_metric_enum" AS ENUM('significant_wave_height', 'wave_mean_direction', 'wave_mean_period', 'wind_speed', 'wind_direction')`,
    );
    await queryRunner.query(
      `ALTER TABLE "forecast_data" ALTER COLUMN "metric" TYPE "public"."forecast_data_metric_enum" USING "metric"::"text"::"public"."forecast_data_metric_enum"`,
    );

    // change 4, create forecast_data_source_enum
    await queryRunner.query(
      `CREATE TYPE "public"."forecast_data_source_enum" AS ENUM('gfs', 'hobo', 'noaa', 'spotter', 'sonde', 'metlog', 'sofar_wave_model', 'hui')`,
    );
    await queryRunner.query(
      `ALTER TABLE "forecast_data" ALTER COLUMN "source" TYPE "public"."forecast_data_source_enum" USING "source"::"text"::"public"."forecast_data_source_enum"`,
    );

    // change 5, create time_series_metric_enum
    await queryRunner.query(
      `CREATE TYPE "public"."time_series_metric_enum" AS ENUM('temp_alert', 'temp_weekly_alert', 'dhw', 'satellite_temperature', 'air_temperature', 'top_temperature', 'bottom_temperature', 'sst_anomaly', 'significant_wave_height', 'wave_mean_period', 'wave_peak_period', 'wave_mean_direction', 'wind_speed', 'wind_direction', 'barometric_pressure_top', 'barometric_pressure_top_diff', 'barometric_pressure_bottom', 'cholorophyll_rfu', 'cholorophyll_concentration', 'conductivity', 'water_depth', 'odo_saturation', 'odo_concentration', 'salinity', 'specific_conductance', 'tds', 'turbidity', 'total_suspended_solids', 'sonde_wiper_position', 'ph', 'ph_mv', 'sonde_battery_voltage', 'sonde_cable_power_voltage', 'pressure', 'precipitation', 'rh', 'wind_gust_speed', 'nitrogen_total', 'phosphorus_total', 'phosphorus', 'silicate', 'nitrate_plus_nitrite', 'ammonium')`,
    );
    await queryRunner.query(
      `ALTER TABLE "time_series" ALTER COLUMN "metric" TYPE "public"."time_series_metric_enum" USING "metric"::"text"::"public"."time_series_metric_enum"`,
    );

    // change 6, re-ordering of metrics_metric_enum
    await queryRunner.query(
      `ALTER TYPE "public"."metrics_metric_enum" RENAME TO "metrics_metric_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."metrics_metric_enum" AS ENUM('temp_alert', 'temp_weekly_alert', 'dhw', 'satellite_temperature', 'air_temperature', 'top_temperature', 'bottom_temperature', 'sst_anomaly', 'significant_wave_height', 'wave_mean_period', 'wave_peak_period', 'wave_mean_direction', 'wind_speed', 'wind_direction', 'barometric_pressure_top', 'barometric_pressure_top_diff', 'barometric_pressure_bottom', 'cholorophyll_rfu', 'cholorophyll_concentration', 'conductivity', 'water_depth', 'odo_saturation', 'odo_concentration', 'salinity', 'specific_conductance', 'tds', 'turbidity', 'total_suspended_solids', 'sonde_wiper_position', 'ph', 'ph_mv', 'sonde_battery_voltage', 'sonde_cable_power_voltage', 'pressure', 'precipitation', 'rh', 'wind_gust_speed', 'nitrogen_total', 'phosphorus_total', 'phosphorus', 'silicate', 'nitrate_plus_nitrite', 'ammonium')`,
    );
    await queryRunner.query(
      `ALTER TABLE "metrics" ALTER COLUMN "metric" TYPE "public"."metrics_metric_enum" USING "metric"::"text"::"public"."metrics_metric_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."metrics_metric_enum_old"`);

    // change 7, re-ordering of sources_type_enum
    await queryRunner.query(
      `ALTER TYPE "public"."sources_type_enum" RENAME TO "sources_type_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."sources_type_enum" AS ENUM('gfs', 'hobo', 'noaa', 'spotter', 'sonde', 'metlog', 'sofar_wave_model', 'hui')`,
    );
    await queryRunner.query(
      `ALTER TABLE "sources" ALTER COLUMN "type" TYPE "public"."sources_type_enum" USING "type"::"text"::"public"."sources_type_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."sources_type_enum_old"`);

    // change 8, re-name historical_monthly_mean.id sequence
    await queryRunner.query(
      `ALTER SEQUENCE "monthly_max_id_seq" RENAME TO "historical_monthly_mean_id_seq"`,
    );

    // change 9, change geometry type (note that video_stream table is empty in production database)
    await queryRunner.query(
      `ALTER TABLE "region" ALTER COLUMN "polygon" TYPE geometry(Point,4326)`,
    );
    await queryRunner.query(
      `ALTER TABLE "site_survey_point" ALTER COLUMN "polygon" TYPE geometry(Point,4326)`,
    );
    await queryRunner.query(
      `ALTER TABLE "site" ALTER COLUMN "polygon" TYPE geometry(Point,4326)`,
    );
    await queryRunner.query(
      `ALTER TABLE "site" ALTER COLUMN "nearest_noaa_location" TYPE geometry(Point,4326)`,
    );
    await queryRunner.query(
      `ALTER TABLE "video_stream" DROP COLUMN "location"`,
    );
    await queryRunner.query(
      `ALTER TABLE "video_stream" ADD "location" geometry(Point,4326)`,
    );
    await queryRunner.query(
      `ALTER TABLE "video_stream" ADD CONSTRAINT "UQ_de4eb243bae87587f9ca56ba8d2" UNIQUE ("location")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_de4eb243bae87587f9ca56ba8d" ON "video_stream" USING GiST ("location")`,
    );

    // change 10, re-name some sequence ids
    await queryRunner.query(
      `ALTER SEQUENCE "reef_application_id_seq" RENAME TO "site_application_id_seq"`,
    );
    await queryRunner.query(
      `ALTER SEQUENCE "reef_audit_id_seq" RENAME TO "site_audit_id_seq"`,
    );
    await queryRunner.query(
      `ALTER SEQUENCE "reef_id_seq" RENAME TO "site_id_seq"`,
    );
    await queryRunner.query(
      `ALTER SEQUENCE "reef_point_of_interest_id_seq" RENAME TO "site_survey_point_id_seq"`,
    );

    // change 11, autogenerate old no_duplicate_signature constraint
    await queryRunner.query(
      `ALTER TABLE "data_uploads" DROP CONSTRAINT "no_duplicate_signature"`,
    );
    await queryRunner.query(
      `ALTER TABLE "data_uploads" ADD CONSTRAINT "UQ_f2362e3b5d4f31b4aa672de773c" UNIQUE ("file", "signature")`,
    );

    // change 12, autogenerate no_duplicated_date constraint
    await queryRunner.query(
      `ALTER TABLE "daily_data" DROP CONSTRAINT no_duplicated_date`,
    );
    await queryRunner.query(
      `ALTER TABLE "daily_data" ADD CONSTRAINT "no_duplicated_date" UNIQUE ("site_id", "date")`,
    );

    // change 13
    await queryRunner.query(
      `ALTER TABLE "historical_monthly_mean" DROP CONSTRAINT "no_duplicated_month"`,
    );

    // change 14, typeorm users_administered_sites_site magic
    await queryRunner.query(
      `DROP INDEX "public"."IDX_088a629ef23eb9eba6ac857ed6"`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_f1d615e782e0367e1868c43439" ON "users_administered_sites_site" ("site_id")`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_da52b9542bf7df43f4840ae439"`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_6a8384baa074fd13f1dc8abbf3" ON "users_administered_sites_site" ("users_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "users_administered_sites_site" DROP CONSTRAINT "FK_088a629ef23eb9eba6ac857ed62"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users_administered_sites_site" ADD CONSTRAINT "FK_f1d615e782e0367e1868c434398" FOREIGN KEY ("site_id") REFERENCES "site"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "users_administered_sites_site" DROP CONSTRAINT "FK_da52b9542bf7df43f4840ae4394"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users_administered_sites_site" ADD CONSTRAINT "FK_6a8384baa074fd13f1dc8abbf37" FOREIGN KEY ("users_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );

    // change 15, typeorm site magic
    await queryRunner.query(
      `ALTER TABLE "site" DROP CONSTRAINT "FK_63c63e16bcebffa7ab94aaddbdb"`,
    );
    await queryRunner.query(
      `ALTER TABLE "site" ADD CONSTRAINT "FK_2d56028954ec00388e734fb266c" FOREIGN KEY ("stream_id") REFERENCES "video_stream"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "site" DROP CONSTRAINT "FK_073078b9b04d1501c3c373fe1b8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "site" ADD CONSTRAINT "FK_ff7a13fae129f15180a3e36f9e2" FOREIGN KEY ("region_id") REFERENCES "region"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_2d56028954ec00388e734fb266" ON "site" ("stream_id")`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_4dd2eeb5079abc8e070e991528"`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ec8dc3dec5ed3c9ab59f22818c" ON "site" USING GiST ("polygon")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ff7a13fae129f15180a3e36f9e" ON "site" ("region_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "site" ALTER COLUMN "name" TYPE character varying`,
    );

    // change 16, typeorm collection_sites_site magic
    await queryRunner.query(
      `DROP INDEX "public"."IDX_e897d8d19dc532bc8c33dc70b5"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_f6cedba5f7ed68f9e67f525905"`,
    );
    await queryRunner.query(
      `ALTER TABLE "collection_sites_site" DROP CONSTRAINT "FK_e897d8d19dc532bc8c33dc70b52"`,
    );
    await queryRunner.query(
      `ALTER TABLE "collection_sites_site" DROP CONSTRAINT "FK_f6cedba5f7ed68f9e67f525905e"`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_8885ccd1c6dcc851e9995099a2" ON "collection_sites_site" ("collection_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_aca88c0064e4a257e5fb2db7ff" ON "collection_sites_site" ("site_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "collection_sites_site" ADD CONSTRAINT "FK_8885ccd1c6dcc851e9995099a2d" FOREIGN KEY ("collection_id") REFERENCES "collection"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "collection_sites_site" ADD CONSTRAINT "FK_aca88c0064e4a257e5fb2db7ff9" FOREIGN KEY ("site_id") REFERENCES "site"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );

    // change 17, typeorm site_survey_point magic
    await queryRunner.query(
      `DROP INDEX "public"."IDX_7d7b340adbd0c281abf2dd56917"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sources" DROP CONSTRAINT "FK_1fc2de0b22c11547cb5f17f14c8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "site_survey_point" DROP CONSTRAINT "FK_4a2bdb6a3cff9c746be703224dc"`,
    );
    await queryRunner.query(
      `ALTER TABLE "survey_media" DROP CONSTRAINT "FK_cdb564bc26282caa4e81306cc92"`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_c26bf9f5e97e4f58fec60cfbb6" ON "site_survey_point" USING GiST ("polygon")`,
    );
    await queryRunner.query(
      `ALTER TABLE "survey_media" ADD CONSTRAINT "FK_687c94fe33408bad80672846e14" FOREIGN KEY ("survey_point_id") REFERENCES "site_survey_point"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "sources" ADD CONSTRAINT "FK_ba2380ca9ef7045e933137e18b3" FOREIGN KEY ("survey_point_id") REFERENCES "site_survey_point"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "site_survey_point" ADD CONSTRAINT "FK_a77a30409a2905313e11d7685d6" FOREIGN KEY ("site_id") REFERENCES "site"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    // change 18, typeorm site_audit magic
    await queryRunner.query(
      `DROP INDEX "public"."IDX_8517aece6ef181f640a5915d31"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_abbd8ec473bccd8696f74d654c"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_e3f8d897db207896108636769a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "site_audit" DROP CONSTRAINT "FK_8fadafdfdbb6c163a0120ca1e3b"`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_928e0f816503baa94ddd494906" ON "site_audit" ("created_at")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_abe9c110dba62d487c211d8db3" ON "site_audit" ("old_value")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_f7ee0e04191b8723c5192944ab" ON "site_audit" ("new_value")`,
    );
    await queryRunner.query(
      `ALTER TABLE "site_audit" ADD CONSTRAINT "FK_5ae17cee9e339b189cf3e220e58" FOREIGN KEY ("site_id") REFERENCES "site"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    // change 19, time_series index
    await queryRunner.query(
      `ALTER INDEX "IDX_cb2f3e83c09f83e8ce007ffd6f" RENAME TO "IDX_time_series_metric_source_timestamp_DESC"`,
    );

    // change 20, typeorm sources magic
    await queryRunner.query(
      `ALTER TABLE "sources" DROP CONSTRAINT "FK_fc8de60fc92ac93f41a52ad01b7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sources" ADD CONSTRAINT "FK_00c69e56d8b69c841a6c3e76a96" FOREIGN KEY ("site_id") REFERENCES "site"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    // change 21, typeorm daily_data magic
    await queryRunner.query(
      `ALTER TABLE "daily_data" DROP CONSTRAINT "FK_281bc33ffb88dab13d8112d22e1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "daily_data" ADD CONSTRAINT "FK_9a513eb5b403b175938dce4bf3b" FOREIGN KEY ("site_id") REFERENCES "site"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    // change 22, typeorm site_application magic
    await queryRunner.query(
      `ALTER TABLE "site_application" DROP CONSTRAINT "FK_77d33d9b9602120cd1529312e77"`,
    );
    await queryRunner.query(
      `ALTER TABLE "site_application" DROP CONSTRAINT "FK_a3ff599da8838fd358d43cec7bc"`,
    );
    await queryRunner.query(
      `ALTER TABLE "site_application" ADD CONSTRAINT "FK_37fc9d09ff7c17d2338203829b1" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "site_application" ADD CONSTRAINT "FK_dcc651c79d9b16e5a159ad4deda" FOREIGN KEY ("site_id") REFERENCES "site"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    // change 23, typeorm historical_monthly_mean magic
    await queryRunner.query(
      `ALTER TABLE "historical_monthly_mean" DROP CONSTRAINT "FK_787e2b4cca2114ef07793eb9be9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "historical_monthly_mean" ADD CONSTRAINT "FK_2e5de2284644a41979436d3820f" FOREIGN KEY ("site_id") REFERENCES "site"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    // change 24, typeorm survey magic
    await queryRunner.query(
      `ALTER TABLE "survey" DROP CONSTRAINT "FK_ac7705ae80042c05f5582938c8a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "survey" ADD CONSTRAINT "FK_5ee3e3571f59efef147b4e6b1f1" FOREIGN KEY ("site_id") REFERENCES "site"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
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
    await queryRunner.query(`DROP MATERIALIZED VIEW "latest_data"`);

    // change 24
    await queryRunner.query(
      `ALTER TABLE "survey" DROP CONSTRAINT "FK_5ee3e3571f59efef147b4e6b1f1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "survey" ADD CONSTRAINT "FK_ac7705ae80042c05f5582938c8a" FOREIGN KEY ("site_id") REFERENCES "site"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    // change 23
    await queryRunner.query(
      `ALTER TABLE "historical_monthly_mean" DROP CONSTRAINT "FK_2e5de2284644a41979436d3820f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "historical_monthly_mean" ADD CONSTRAINT "FK_787e2b4cca2114ef07793eb9be9" FOREIGN KEY ("site_id") REFERENCES "site"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    // change 22
    await queryRunner.query(
      `ALTER TABLE "site_application" DROP CONSTRAINT "FK_dcc651c79d9b16e5a159ad4deda"`,
    );
    await queryRunner.query(
      `ALTER TABLE "site_application" DROP CONSTRAINT "FK_37fc9d09ff7c17d2338203829b1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "site_application" ADD CONSTRAINT "FK_77d33d9b9602120cd1529312e77" FOREIGN KEY ("site_id") REFERENCES "site"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "site_application" ADD CONSTRAINT "FK_a3ff599da8838fd358d43cec7bc" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    // change 21
    await queryRunner.query(
      `ALTER TABLE "daily_data" DROP CONSTRAINT "FK_9a513eb5b403b175938dce4bf3b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "daily_data" ADD CONSTRAINT "FK_281bc33ffb88dab13d8112d22e1" FOREIGN KEY ("site_id") REFERENCES "site"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    // change 20
    await queryRunner.query(
      `ALTER TABLE "sources" DROP CONSTRAINT "FK_00c69e56d8b69c841a6c3e76a96"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sources" ADD CONSTRAINT "FK_fc8de60fc92ac93f41a52ad01b7" FOREIGN KEY ("site_id") REFERENCES "site"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    // change 19
    await queryRunner.query(
      `ALTER INDEX "IDX_time_series_metric_source_timestamp_DESC" RENAME TO "IDX_cb2f3e83c09f83e8ce007ffd6f"`,
    );

    // change 18
    await queryRunner.query(
      `ALTER TABLE "site_audit" DROP CONSTRAINT "FK_5ae17cee9e339b189cf3e220e58"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_f7ee0e04191b8723c5192944ab"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_abe9c110dba62d487c211d8db3"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_928e0f816503baa94ddd494906"`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_8517aece6ef181f640a5915d31" ON "site_audit" ("new_value")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_abbd8ec473bccd8696f74d654c" ON "site_audit" ("old_value")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e3f8d897db207896108636769a" ON "site_audit" ("created_at")`,
    );
    await queryRunner.query(
      `ALTER TABLE "site_audit" ADD CONSTRAINT "FK_8fadafdfdbb6c163a0120ca1e3b" FOREIGN KEY ("site_id") REFERENCES "site"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    // change 17
    await queryRunner.query(
      `ALTER TABLE "site_survey_point" DROP CONSTRAINT "FK_a77a30409a2905313e11d7685d6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sources" DROP CONSTRAINT "FK_ba2380ca9ef7045e933137e18b3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "survey_media" DROP CONSTRAINT "FK_687c94fe33408bad80672846e14"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_c26bf9f5e97e4f58fec60cfbb6"`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_7d7b340adbd0c281abf2dd56917" ON "site_survey_point" USING GiST ("polygon")`,
    );
    await queryRunner.query(
      `ALTER TABLE "sources" ADD CONSTRAINT "FK_1fc2de0b22c11547cb5f17f14c8" FOREIGN KEY ("survey_point_id") REFERENCES "site_survey_point"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "site_survey_point" ADD CONSTRAINT "FK_4a2bdb6a3cff9c746be703224dc" FOREIGN KEY ("site_id") REFERENCES "site"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "survey_media" ADD CONSTRAINT "FK_cdb564bc26282caa4e81306cc92" FOREIGN KEY ("survey_point_id") REFERENCES "site_survey_point"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );

    // change 16
    await queryRunner.query(
      `ALTER TABLE "collection_sites_site" DROP CONSTRAINT "FK_aca88c0064e4a257e5fb2db7ff9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "collection_sites_site" DROP CONSTRAINT "FK_8885ccd1c6dcc851e9995099a2d"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_aca88c0064e4a257e5fb2db7ff"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_8885ccd1c6dcc851e9995099a2"`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e897d8d19dc532bc8c33dc70b5" ON "collection_sites_site" ("site_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_f6cedba5f7ed68f9e67f525905" ON "collection_sites_site" ("collection_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "collection_sites_site" ADD CONSTRAINT "FK_e897d8d19dc532bc8c33dc70b52" FOREIGN KEY ("site_id") REFERENCES "site"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "collection_sites_site" ADD CONSTRAINT "FK_f6cedba5f7ed68f9e67f525905e" FOREIGN KEY ("collection_id") REFERENCES "collection"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    // change 15
    await queryRunner.query(
      `DROP INDEX "public"."IDX_2d56028954ec00388e734fb266"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ec8dc3dec5ed3c9ab59f22818c"`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_4dd2eeb5079abc8e070e991528" ON "site" USING GiST ("polygon")`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ff7a13fae129f15180a3e36f9e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "site" DROP CONSTRAINT "FK_ff7a13fae129f15180a3e36f9e2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "site" ADD CONSTRAINT "FK_073078b9b04d1501c3c373fe1b8" FOREIGN KEY ("region_id") REFERENCES "region"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "site" DROP CONSTRAINT "FK_2d56028954ec00388e734fb266c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "site" ADD CONSTRAINT "FK_63c63e16bcebffa7ab94aaddbdb" FOREIGN KEY ("stream_id") REFERENCES "video_stream"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );

    // change 14
    await queryRunner.query(
      `DROP INDEX "public"."IDX_f1d615e782e0367e1868c43439"`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_088a629ef23eb9eba6ac857ed6" ON "users_administered_sites_site" ("site_id")`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_6a8384baa074fd13f1dc8abbf3"`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_da52b9542bf7df43f4840ae439" ON "users_administered_sites_site" ("users_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "users_administered_sites_site" DROP CONSTRAINT "FK_f1d615e782e0367e1868c434398"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users_administered_sites_site" ADD CONSTRAINT "FK_088a629ef23eb9eba6ac857ed62" FOREIGN KEY ("site_id") REFERENCES "site"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "users_administered_sites_site" DROP CONSTRAINT "FK_6a8384baa074fd13f1dc8abbf37"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users_administered_sites_site" ADD CONSTRAINT "FK_da52b9542bf7df43f4840ae4394" FOREIGN KEY ("users_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    // change 13
    await queryRunner.query(
      `ALTER TABLE "historical_monthly_mean" ADD CONSTRAINT "no_duplicated_month" EXCLUDE USING gist (site_id WITH =, month WITH =)`,
    );

    // change 12
    await queryRunner.query(
      `ALTER TABLE "daily_data" DROP CONSTRAINT no_duplicated_date`,
    );
    await queryRunner.query(
      `ALTER TABLE "daily_data" ADD CONSTRAINT "no_duplicated_date" EXCLUDE USING gist (site_id WITH =, date(date) WITH =)`,
    );

    // change 11
    await queryRunner.query(
      `ALTER TABLE "data_uploads" DROP CONSTRAINT "UQ_f2362e3b5d4f31b4aa672de773c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "data_uploads" ADD CONSTRAINT "no_duplicate_signature" UNIQUE ("file", "signature")`,
    );

    // change 10
    await queryRunner.query(
      `ALTER SEQUENCE "site_application_id_seq" RENAME TO "reef_application_id_seq"`,
    );
    await queryRunner.query(
      `ALTER SEQUENCE "site_audit_id_seq" RENAME TO "reef_audit_id_seq"`,
    );
    await queryRunner.query(
      `ALTER SEQUENCE "site_id_seq" RENAME TO "reef_id_seq"`,
    );
    await queryRunner.query(
      `ALTER SEQUENCE "site_survey_point_id_seq" RENAME TO "reef_point_of_interest_id_seq"`,
    );

    // change 9
    await queryRunner.query(
      `ALTER TABLE "site" ALTER COLUMN "nearest_noaa_location" TYPE geometry(GEOMETRY,0)`,
    );
    await queryRunner.query(
      `ALTER TABLE "site" ALTER COLUMN "polygon" TYPE geometry(GEOMETRY,0)`,
    );
    await queryRunner.query(
      `ALTER TABLE "site_survey_point" ALTER COLUMN "polygon" TYPE geometry(GEOMETRY,0)`,
    );
    await queryRunner.query(
      `ALTER TABLE "region" ALTER COLUMN "polygon" TYPE geometry(GEOMETRY,0)`,
    );
    await queryRunner.query(
      `ALTER TABLE "video_stream" DROP CONSTRAINT "UQ_de4eb243bae87587f9ca56ba8d2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "video_stream" DROP COLUMN "location"`,
    );
    await queryRunner.query(
      `ALTER TABLE "video_stream" ADD "location" point NOT NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_de4eb243bae87587f9ca56ba8d" ON "video_stream" USING GiST ("location")`,
    );

    // change 8
    await queryRunner.query(
      `ALTER SEQUENCE "historical_monthly_mean_id_seq" RENAME TO "monthly_max_id_seq"`,
    );

    // change 7
    // no downgrade needed, since it is only re-ordering of the enum.

    // change 6
    // no downgrade needed, since it is only re-ordering of the enum.

    // change 5
    await queryRunner.query(
      `ALTER TABLE "time_series" ALTER COLUMN "metric" TYPE "public"."metrics_metric_enum" USING "metric"::"text"::"public"."metrics_metric_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."time_series_metric_enum"`);

    // change 4
    await queryRunner.query(
      `ALTER TABLE "forecast_data" ALTER COLUMN "source" TYPE "public"."sources_type_enum" USING "source"::"text"::"public"."sources_type_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."forecast_data_source_enum"`);

    // change 3
    await queryRunner.query(
      `ALTER TABLE "forecast_data" ALTER COLUMN "metric" TYPE "public"."metrics_metric_enum" USING "metric"::"text"::"public"."metrics_metric_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."forecast_data_metric_enum"`);

    // change 2
    await queryRunner.query(
      `ALTER TABLE "data_uploads" ALTER COLUMN "sensor_type" TYPE "public"."sources_type_enum" USING "sensor_type"::"text"::"public"."sources_type_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."data_uploads_sensor_type_enum"`,
    );

    // change: 1
    await queryRunner.query(
      `ALTER TABLE "site_application" ALTER COLUMN "uid" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "site_application" DROP CONSTRAINT "UQ_5f257a9a881454e9b640ea4c303"`,
    );
    await queryRunner.query(
      `ALTER TABLE "site_application" ALTER COLUMN "uid" TYPE character varying;`,
    );
    await queryRunner.query(
      `ALTER TABLE "site_application" ALTER COLUMN "uid" SET DEFAULT gen_random_uuid()`,
    );
    await queryRunner.query(
      `ALTER TABLE "site_application" ADD CONSTRAINT "UQ_adfd79a75e1f1b576138711e9b5" UNIQUE ("uid")`,
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
