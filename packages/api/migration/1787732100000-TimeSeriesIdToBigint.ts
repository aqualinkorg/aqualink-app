import { MigrationInterface, QueryRunner } from 'typeorm';

const LATEST_DATA_SQL = `SELECT DISTINCT ON (metric, type, site_id, survey_point_id) "time_series"."id", metric, timestamp, value, type AS "source", site_id, survey_point_id FROM "time_series" "time_series" INNER JOIN "sources" "sources" ON "sources"."id" = "time_series"."source_id" WHERE timestamp >= current_date - INTERVAL '7 days' OR type IN ('sonde') AND (timestamp >= current_date - INTERVAL '2 years') OR type IN ('hui') AND (timestamp >= current_date - INTERVAL '2 years') OR type IN ('sheet_data') AND (timestamp >= current_date - INTERVAL '2 years') OR type IN ('hwo') AND (timestamp >= current_date - INTERVAL '2 years') ORDER BY metric, type, site_id, survey_point_id, timestamp DESC`;

/**
 * time_series_id_seq hit integer max (2147483647) while the table only
 * has ~74M live rows. INSERT ON CONFLICT still consumes nextval().
 *
 * This rewrite takes ACCESS EXCLUSIVE on time_series (expect ~5–20 min
 * on ~15 GB). Pause spotter/SST/wave writers before running.
 */
export class TimeSeriesIdToBigint1787732100000 implements MigrationInterface {
  name = 'TimeSeriesIdToBigint1787732100000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`SET LOCAL statement_timeout = '30min'`);
    await queryRunner.query(`SET LOCAL lock_timeout = '60s'`);

    await queryRunner.query(
      `DELETE FROM "typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "schema" = $3`,
      ['MATERIALIZED_VIEW', 'latest_data', 'public'],
    );
    await queryRunner.query(`DROP MATERIALIZED VIEW IF EXISTS "latest_data"`);

    await queryRunner.query(
      `ALTER TABLE "time_series" ALTER COLUMN "id" TYPE bigint`,
    );
    await queryRunner.query(`ALTER SEQUENCE "time_series_id_seq" AS bigint`);

    await queryRunner.query(
      `CREATE MATERIALIZED VIEW "latest_data" AS ${LATEST_DATA_SQL}`,
    );
    await queryRunner.query(
      `INSERT INTO "typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES (DEFAULT, $1, DEFAULT, $2, $3, $4)`,
      ['public', 'MATERIALIZED_VIEW', 'latest_data', LATEST_DATA_SQL],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const [{ max }] = await queryRunner.query(
      `SELECT MAX(id) AS max FROM "time_series"`,
    );
    if (Number(max) > 2147483647) {
      throw new Error(
        `Cannot revert TimeSeriesIdToBigint: max(id)=${max} exceeds integer range`,
      );
    }

    await queryRunner.query(`SET LOCAL statement_timeout = '30min'`);
    await queryRunner.query(`SET LOCAL lock_timeout = '60s'`);

    await queryRunner.query(
      `DELETE FROM "typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "schema" = $3`,
      ['MATERIALIZED_VIEW', 'latest_data', 'public'],
    );
    await queryRunner.query(`DROP MATERIALIZED VIEW IF EXISTS "latest_data"`);

    await queryRunner.query(`ALTER SEQUENCE "time_series_id_seq" AS integer`);
    await queryRunner.query(
      `ALTER TABLE "time_series" ALTER COLUMN "id" TYPE integer`,
    );

    await queryRunner.query(
      `CREATE MATERIALIZED VIEW "latest_data" AS ${LATEST_DATA_SQL}`,
    );
    await queryRunner.query(
      `INSERT INTO "typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES (DEFAULT, $1, DEFAULT, $2, $3, $4)`,
      ['public', 'MATERIALIZED_VIEW', 'latest_data', LATEST_DATA_SQL],
    );
  }
}
