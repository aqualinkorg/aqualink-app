import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddHWODataSource1786642200001 implements MigrationInterface {
  name = 'AddHWODataSource1786642200001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."sources_type_enum" ADD VALUE IF NOT EXISTS 'hwo'`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."time_series_metric_enum" ADD VALUE IF NOT EXISTS 'enterococcus'`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."time_series_metric_enum" ADD VALUE IF NOT EXISTS 'turbidity_1'`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."time_series_metric_enum" ADD VALUE IF NOT EXISTS 'turbidity_2'`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."time_series_metric_enum" ADD VALUE IF NOT EXISTS 'turbidity_3'`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."time_series_metric_enum" ADD VALUE IF NOT EXISTS 'turbidity_4'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Recreating the enum requires dropping dependents first. latest_data
    // reads sources.type; delete hwo rows so the recast does not fail.
    await queryRunner.query(
      `DELETE FROM "typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "schema" = $3`,
      ['MATERIALIZED_VIEW', 'latest_data', 'public'],
    );
    await queryRunner.query(`DROP MATERIALIZED VIEW IF EXISTS "latest_data"`);
    await queryRunner.query(`DELETE FROM "sources" WHERE "type" = 'hwo'`);

    await queryRunner.query(
      `ALTER TYPE "public"."sources_type_enum" RENAME TO "sources_type_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."sources_type_enum" AS ENUM('gfs', 'hobo', 'noaa', 'spotter', 'sonde', 'metlog', 'sofar_model', 'hui', 'sheet_data', 'seaphox', 'open_meteo')`,
    );
    await queryRunner.query(
      `ALTER TABLE "sources" ALTER COLUMN "type" TYPE "public"."sources_type_enum" USING "type"::"text"::"public"."sources_type_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."sources_type_enum_old"`);

    const viewSQL = `SELECT DISTINCT ON (metric, type, site_id, survey_point_id) "time_series"."id", metric, timestamp, value, type AS "source", site_id, survey_point_id FROM "time_series" "time_series" INNER JOIN "sources" "sources" ON "sources"."id" = "time_series"."source_id" WHERE timestamp >= current_date - INTERVAL '7 days' OR type IN ('sonde') AND (timestamp >= current_date - INTERVAL '2 years') OR type IN ('hui') AND (timestamp >= current_date - INTERVAL '2 years') OR type IN ('sheet_data') AND (timestamp >= current_date - INTERVAL '2 years') ORDER BY metric, type, site_id, survey_point_id, timestamp DESC`;

    await queryRunner.query(
      `CREATE MATERIALIZED VIEW "latest_data" AS ${viewSQL}`,
    );
    await queryRunner.query(
      `INSERT INTO "typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES (DEFAULT, $1, DEFAULT, $2, $3, $4)`,
      ['public', 'MATERIALIZED_VIEW', 'latest_data', viewSQL],
    );
  }
}
