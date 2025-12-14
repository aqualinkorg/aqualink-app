// Extending the latest data range for custom sources, to show the additional metrics card in more cases
import { MigrationInterface, QueryRunner } from 'typeorm';

export class ExtendLatestDataInterval1687531559398 implements MigrationInterface {
  name = 'ExtendLatestDataInterval1687531559398';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "schema" = $3`,
      ['MATERIALIZED_VIEW', 'latest_data', 'public'],
    );
    await queryRunner.query(`DROP MATERIALIZED VIEW "latest_data"`);

    await queryRunner.query(
      `CREATE MATERIALIZED VIEW "latest_data" AS SELECT DISTINCT ON (metric, type, site_id, survey_point_id) "time_series"."id", metric, timestamp, value, type AS "source", site_id, survey_point_id FROM "time_series" "time_series" INNER JOIN "sources" "sources" ON "sources"."id" = "time_series"."source_id" WHERE timestamp >= current_date - INTERVAL '7 days' OR type IN ('sonde') AND (timestamp >= current_date - INTERVAL '180 days') OR type IN ('hui') AND (timestamp >= current_date - INTERVAL '180 days') OR type IN ('sheet_data') AND (timestamp >= current_date - INTERVAL '180 days') ORDER BY metric, type, site_id, survey_point_id, timestamp DESC`,
    );
    await queryRunner.query(
      `INSERT INTO "typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES (DEFAULT, $1, DEFAULT, $2, $3, $4)`,
      [
        'public',
        'MATERIALIZED_VIEW',
        'latest_data',
        'SELECT DISTINCT ON (metric, type, site_id, survey_point_id) "time_series"."id", metric, timestamp, value, type AS "source", site_id, survey_point_id FROM "time_series" "time_series" INNER JOIN "sources" "sources" ON "sources"."id" = "time_series"."source_id" WHERE timestamp >= current_date - INTERVAL \'7 days\' OR type IN (\'sonde\') AND (timestamp >= current_date - INTERVAL \'180 days\') OR type IN (\'hui\') AND (timestamp >= current_date - INTERVAL \'180 days\') OR type IN (\'sheet_data\') AND (timestamp >= current_date - INTERVAL \'180 days\') ORDER BY metric, type, site_id, survey_point_id, timestamp DESC',
      ],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "schema" = $3`,
      ['MATERIALIZED_VIEW', 'latest_data', 'public'],
    );
    await queryRunner.query(`DROP MATERIALIZED VIEW "latest_data"`);

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
