import { MigrationInterface, QueryRunner } from 'typeorm';

export class SplitSofarMetric1618233737868 implements MigrationInterface {
  name = 'SplitSofarMetric1618233737868';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP VIEW "latest_data"`);
    await queryRunner.query(
      `ALTER TABLE "sources" DROP CONSTRAINT "no_duplicate_sources"`,
    );
    await queryRunner.query(`DROP INDEX "IDX_84204417a187000377a03dc532"`);

    await queryRunner.query(
      `ALTER TYPE "sources_type_enum" RENAME TO  "sources_type_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "sources_type_enum" AS ENUM('spotter', 'hobo', 'noaa', 'gfs')`,
    );
    await queryRunner.query(
      `ALTER TABLE "sources" ALTER COLUMN "type" TYPE "sources_type_enum" USING "type"::"text"::"sources_type_enum"`,
    );
    await queryRunner.query(`DROP TYPE "sources_type_enum_old"`);

    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_84204417a187000377a03dc532" ON "sources" ("reef_id", "type") WHERE "poi_id" IS NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "sources" ADD CONSTRAINT "no_duplicate_sources" UNIQUE ("reef_id", "poi_id", "type")`,
    );
    await queryRunner.query(
      `CREATE VIEW "latest_data" AS SELECT
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

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP VIEW "latest_data"`);
    await queryRunner.query(
      `ALTER TABLE "sources" DROP CONSTRAINT "no_duplicate_sources"`,
    );
    await queryRunner.query(`DROP INDEX "IDX_84204417a187000377a03dc532"`);

    await queryRunner.query(
      `CREATE TYPE "sources_type_enum_old" AS ENUM('spotter', 'hobo', 'sofar_api')`,
    );
    await queryRunner.query(
      `ALTER TABLE "sources" ALTER COLUMN "type" TYPE "sources_type_enum_old" USING "type"::"text"::"sources_type_enum_old"`,
    );
    await queryRunner.query(`DROP TYPE "sources_type_enum"`);
    await queryRunner.query(
      `ALTER TYPE "sources_type_enum_old" RENAME TO  "sources_type_enum"`,
    );

    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_84204417a187000377a03dc532" ON "sources" ("reef_id", "type") WHERE "poi_id" IS NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "sources" ADD CONSTRAINT "no_duplicate_sources" UNIQUE ("reef_id", "poi_id", "type")`,
    );
    await queryRunner.query(
      `CREATE VIEW "latest_data" AS SELECT
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
