import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBarometricDiffToLatestData1664271096083
  implements MigrationInterface
{
  name = 'AddBarometricDiffToLatestData1664271096083';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP MATERIALIZED VIEW "latest_data"`);
    await queryRunner.query(
      `CREATE MATERIALIZED VIEW "latest_data"
          AS ( 
            SELECT
              DISTINCT ON (metric, type, site_id, survey_point_id)
              "time_series"."id", metric, timestamp, value, type AS "source", site_id, survey_point_id
            FROM "time_series" "time_series"
            INNER JOIN "sources" "sources" ON "sources"."id" = "time_series"."source_id"
            WHERE timestamp >= current_date - INTERVAL '7 days'
            OR type IN ('sonde') AND (timestamp >= current_date - INTERVAL '90 days')
            ORDER BY metric, type, site_id, survey_point_id, timestamp desc
          )
          union 
            (
              select *
              from (
                select 
                  id,
                  'barometric_pressure_diff'::metrics_metric_enum as metric,
                  "timestamp",
                  value -lead(value) over(partition by site_id order by "timestamp" desc) as value,
                  source,
                  site_id,
                  survey_point_id
                from (
                  select ts.id, metric, "timestamp", value, type as "source", site_id, s.survey_point_id,
                  row_number() over (
                      partition  by site_id
                      order by "timestamp" desc 
                  ) as rownum
                  from time_series ts
                  inner join sources s on s.id = ts.source_id 
                  where metric = 'barometric_pressure' 
                ) q1
                where q1.rownum <= 2
              ) as q2
              where value is not null
            )`,
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
                WHERE timestamp >= current_date - INTERVAL '7 days'
                OR type IN ('sonde') AND (timestamp >= current_date - INTERVAL '90 days')
                ORDER BY metric, type, site_id, survey_point_id, timestamp DESC`,
    );
  }
}
