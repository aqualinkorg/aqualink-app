import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeLatestView1618831541663 implements MigrationInterface {
  name = 'ChangeLatestView1618831541663';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP VIEW "latest_data"`);
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

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP MATERIALIZED VIEW "latest_data"`);
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
