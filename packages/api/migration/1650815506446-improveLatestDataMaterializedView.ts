import { MigrationInterface, QueryRunner } from 'typeorm';

export class improveLatestDataMaterializedView1650815506446
  implements MigrationInterface
{
  name = 'improveLatestDataMaterializedView1650815506446';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP MATERIALIZED VIEW "latest_data"`);
    await queryRunner.query(
      `CREATE MATERIALIZED VIEW "latest_data"
            AS SELECT
                DISTINCT ON (metric, type, site_id, survey_point_id)
                "time_series"."id", metric, timestamp, value, type AS "source", site_id, survey_point_id
            FROM "time_series" "time_series"
            INNER JOIN "sources" "sources" ON "sources"."id" = "time_series"."source_id"
            WHERE timestamp > current_date - interval '7' day
            ORDER BY metric, type, site_id, survey_point_id, timestamp DESC`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP MATERIALIZED VIEW "latest_data"`);
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
