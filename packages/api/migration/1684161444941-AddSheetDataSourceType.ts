import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSheetDataSourceType1684161444941 implements MigrationInterface {
  name = 'AddSheetDataSourceType1684161444941';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // wrapping migration with DROP and CREATE of the materialized view.
    await queryRunner.query(
      `DELETE FROM "typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "schema" = $3`,
      ['MATERIALIZED_VIEW', 'latest_data', 'public'],
    );
    await queryRunner.query(`DROP MATERIALIZED VIEW IF EXISTS "latest_data"`);

    await queryRunner.query(
      `ALTER TYPE "public"."data_uploads_sensor_type_enum" RENAME TO "data_uploads_sensor_type_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."data_uploads_sensor_type_enum" AS ENUM('gfs', 'hobo', 'noaa', 'spotter', 'sonde', 'metlog', 'sofar_model', 'hui', 'sheet_data')`,
    );
    await queryRunner.query(
      `ALTER TABLE "data_uploads" ALTER COLUMN "sensor_type" TYPE "public"."data_uploads_sensor_type_enum" USING "sensor_type"::"text"::"public"."data_uploads_sensor_type_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."data_uploads_sensor_type_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."sources_type_enum" RENAME TO "sources_type_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."sources_type_enum" AS ENUM('gfs', 'hobo', 'noaa', 'spotter', 'sonde', 'metlog', 'sofar_model', 'hui', 'sheet_data')`,
    );
    await queryRunner.query(
      `ALTER TABLE "sources" ALTER COLUMN "type" TYPE "public"."sources_type_enum" USING "type"::"text"::"public"."sources_type_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."sources_type_enum_old"`);
    await queryRunner.query(
      `ALTER TABLE "forecast_data" DROP CONSTRAINT "one_row_per_site_per_metric_per_source"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."forecast_data_source_enum" RENAME TO "forecast_data_source_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."forecast_data_source_enum" AS ENUM('gfs', 'hobo', 'noaa', 'spotter', 'sonde', 'metlog', 'sofar_model', 'hui', 'sheet_data')`,
    );
    await queryRunner.query(
      `ALTER TABLE "forecast_data" ALTER COLUMN "source" TYPE "public"."forecast_data_source_enum" USING "source"::"text"::"public"."forecast_data_source_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."forecast_data_source_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "forecast_data" ADD CONSTRAINT "one_row_per_site_per_metric_per_source" UNIQUE ("site_id", "metric", "source")`,
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
      `ALTER TABLE "forecast_data" DROP CONSTRAINT "one_row_per_site_per_metric_per_source"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."forecast_data_source_enum_old" AS ENUM('gfs', 'hobo', 'noaa', 'spotter', 'sonde', 'metlog', 'sofar_model', 'hui')`,
    );
    await queryRunner.query(
      `ALTER TABLE "forecast_data" ALTER COLUMN "source" TYPE "public"."forecast_data_source_enum_old" USING "source"::"text"::"public"."forecast_data_source_enum_old"`,
    );
    await queryRunner.query(`DROP TYPE "public"."forecast_data_source_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."forecast_data_source_enum_old" RENAME TO "forecast_data_source_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "forecast_data" ADD CONSTRAINT "one_row_per_site_per_metric_per_source" UNIQUE ("metric", "site_id", "source")`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."sources_type_enum_old" AS ENUM('gfs', 'hobo', 'noaa', 'spotter', 'sonde', 'metlog', 'hui', 'sofar_model')`,
    );
    await queryRunner.query(
      `ALTER TABLE "sources" ALTER COLUMN "type" TYPE "public"."sources_type_enum_old" USING "type"::"text"::"public"."sources_type_enum_old"`,
    );
    await queryRunner.query(`DROP TYPE "public"."sources_type_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."sources_type_enum_old" RENAME TO "sources_type_enum"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."data_uploads_sensor_type_enum_old" AS ENUM('gfs', 'hobo', 'noaa', 'spotter', 'sonde', 'metlog', 'hui', 'sofar_model')`,
    );
    await queryRunner.query(
      `ALTER TABLE "data_uploads" ALTER COLUMN "sensor_type" TYPE "public"."data_uploads_sensor_type_enum_old" USING "sensor_type"::"text"::"public"."data_uploads_sensor_type_enum_old"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."data_uploads_sensor_type_enum"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."data_uploads_sensor_type_enum_old" RENAME TO "data_uploads_sensor_type_enum"`,
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
