import { MigrationInterface, QueryRunner } from 'typeorm';

export class improveLatestDataMaterializedView1650815506446 implements MigrationInterface {
  name = 'improveLatestDataMaterializedView1650815506446';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP MATERIALIZED VIEW "latest_data"`);

    // Edit sources enum
    await queryRunner.query(
      `ALTER TYPE "public"."sources_type_enum" ADD VALUE IF NOT EXISTS 'sofar_wave_model'`,
    );

    await queryRunner.query(
      `CREATE MATERIALIZED VIEW "latest_data"
            AS SELECT
                DISTINCT ON (metric, type, site_id, survey_point_id)
                "time_series"."id", metric, timestamp, value, type AS "source", site_id, survey_point_id
            FROM "time_series" "time_series"
            INNER JOIN "sources" "sources" ON "sources"."id" = "time_series"."source_id"
            WHERE timestamp >= current_date - INTERVAL '7 days'
            OR type IN ('sonde') AND (timestamp >= current_date - INTERVAL '90 days')
            ORDER BY metric, type, site_id, survey_point_id, timestamp DESC`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP MATERIALIZED VIEW "latest_data"`);

    // Edit sources enum
    await queryRunner.query(
      `CREATE TYPE "public"."sources_type_enum_old" AS ENUM('spotter', 'hobo', 'noaa', 'gfs', 'sonde', 'metlog')`,
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

    await queryRunner.query(
      `CREATE MATERIALIZED VIEW "latest_data"
            AS SELECT
                DISTINCT ON (metric, type, site_id, survey_point_id)
                "time_series"."id", metric, timestamp, value, type AS "source", site_id, survey_point_id
            FROM "time_series" "time_series"
            INNER JOIN "sources" "sources" ON "sources"."id" = "time_series"."source_id"
            ORDER BY metric, type, site_id, survey_point_id, timestamp DESC`,
    );
  }
}
