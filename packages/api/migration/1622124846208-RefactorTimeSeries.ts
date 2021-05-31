import { MigrationInterface, QueryRunner } from 'typeorm';

export class RefactorTimeSeries1622124846208 implements MigrationInterface {
  name = 'RefactorTimeSeries1622124846208';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP MATERIALIZED VIEW "latest_data"');
    await queryRunner.query(
      `ALTER TABLE "time_series" DROP CONSTRAINT "FK_97235131108c5dfd9a68150ff8e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "time_series" DROP CONSTRAINT "FK_88a659ad442c11d3a5400b3def4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "time_series" DROP CONSTRAINT "no_duplicate_reef_data"`,
    );
    await queryRunner.query(
      `ALTER TABLE "time_series" DROP CONSTRAINT "no_duplicate_data"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sources" RENAME COLUMN "spotter_id" TO "sensor_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "exclusion_dates" RENAME COLUMN "spotter_id" TO "sensor_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "reef" RENAME COLUMN "spotter_id" TO "sensor_id"`,
    );
    await queryRunner.query(`ALTER TABLE "time_series" DROP COLUMN "reef_id"`);
    await queryRunner.query(`ALTER TABLE "time_series" DROP COLUMN "poi_id"`);
    await queryRunner.query(
      `ALTER TABLE "time_series" ADD CONSTRAINT "no_duplicate_data" UNIQUE ("metric", "source_id", "timestamp")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_cb2f3e83c09f83e8ce007ffd6f" ON "time_series" ("metric", "source_id", "timestamp" DESC )`,
    );
    await queryRunner.query(
      `CREATE MATERIALIZED VIEW "latest_data" AS
        SELECT 
        "time_series".id,
        "time_series".metric,
        "time_series".timestamp,
        "time_series".value,
        "source"."type" AS "source",
        "source"."reef_id" AS "reef_id",
        "source"."poi_id" AS "poi_id"
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
    await queryRunner.query(`DROP MATERIALIZED VIEW "latest_data"`);
    await queryRunner.query(`DROP INDEX "IDX_cb2f3e83c09f83e8ce007ffd6f"`);
    await queryRunner.query(`ALTER TABLE "time_series" ADD "poi_id" integer`);
    await queryRunner.query(`ALTER TABLE "time_series" ADD "reef_id" integer`);
    await queryRunner.query(
      `ALTER TABLE "sources" RENAME COLUMN "sensor_id" TO "spotter_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "exclusion_dates" RENAME COLUMN "sensor_id" TO "spotter_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "reef" RENAME COLUMN "sensor_id" TO "spotter_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "time_series" DROP CONSTRAINT "no_duplicate_data"`,
    );
    await queryRunner.query(
      `ALTER TABLE "time_series" ADD CONSTRAINT "no_duplicate_data" UNIQUE ("timestamp", "poi_id", "reef_id", "metric", "source_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "time_series" ADD CONSTRAINT "no_duplicate_reef_data" UNIQUE ("timestamp", "reef_id", "metric", "source_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "time_series" ADD CONSTRAINT "FK_88a659ad442c11d3a5400b3def4" FOREIGN KEY ("reef_id") REFERENCES "reef"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "time_series" ADD CONSTRAINT "FK_97235131108c5dfd9a68150ff8e" FOREIGN KEY ("poi_id") REFERENCES "reef_point_of_interest"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `CREATE MATERIALIZED VIEW "latest_data" AS SELECT
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
