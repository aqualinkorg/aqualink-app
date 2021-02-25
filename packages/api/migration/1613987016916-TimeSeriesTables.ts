import { MigrationInterface, QueryRunner } from 'typeorm';

export class TimeSeriesTables1613987016916 implements MigrationInterface {
  name = 'TimeSeriesTables1613987016916';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "sources_type_enum" AS ENUM('spotter', 'hobo', 'sofar_api')`,
    );
    await queryRunner.query(
      `CREATE TABLE "sources" ("id" SERIAL NOT NULL, "type" "sources_type_enum" NOT NULL, "depth" double precision, "spotter_id" character varying, "reef_id" integer, "poi_id" integer, CONSTRAINT "PK_85523beafe5a2a6b90b02096443" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "metrics_metric_enum" AS ENUM('alert', 'dhw', 'satellite_temperature', 'surface_temperature', 'bottom_temperature', 'sst_anomaly')`,
    );
    await queryRunner.query(
      `CREATE TYPE "metrics_units_enum" AS ENUM('celsius', 'm', 'm/s', 'dhw')`,
    );
    await queryRunner.query(
      `CREATE TABLE "metrics" ("id" SERIAL NOT NULL, "metric" "metrics_metric_enum" NOT NULL, "description" character varying NOT NULL, "units" "metrics_units_enum" NOT NULL, CONSTRAINT "PK_5283cad666a83376e28a715bf0e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "time_series" (
        "id" SERIAL NOT NULL,
        "timestamp" TIMESTAMP NOT NULL,
        "value" double precision NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "reef_id" integer, "poi_id" integer,
        "metric_id" integer NOT NULL,
        "source_id" integer,
        CONSTRAINT "PK_e472f6a5f5bce1c709008a24fe8" PRIMARY KEY ("id")
      )`,
    );
    await queryRunner.query(
      `ALTER TABLE "sources" ADD CONSTRAINT "FK_fc8de60fc92ac93f41a52ad01b7" FOREIGN KEY ("reef_id") REFERENCES "reef"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "sources" ADD CONSTRAINT "FK_1fc2de0b22c11547cb5f17f14c8" FOREIGN KEY ("poi_id") REFERENCES "reef_point_of_interest"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "time_series" ADD CONSTRAINT "FK_88a659ad442c11d3a5400b3def4" FOREIGN KEY ("reef_id") REFERENCES "reef"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "time_series" ADD CONSTRAINT "FK_97235131108c5dfd9a68150ff8e" FOREIGN KEY ("poi_id") REFERENCES "reef_point_of_interest"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "time_series" ADD CONSTRAINT "FK_769f6576134f6f18b1f23108c45" FOREIGN KEY ("metric_id") REFERENCES "metrics"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "time_series" ADD CONSTRAINT "FK_fb5d7b75a674607b65fa78d5c92" FOREIGN KEY ("source_id") REFERENCES "sources"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `CREATE VIEW "latest_data" AS
        SELECT
          DISTINCT ON (metric_id, source_id, time_series.reef_id, time_series.poi_id) "metric"."metric" AS "metric",
          "time_series"."id" AS "id",
          "source"."type" AS "source",
          timestamp,
          value,
          "time_series"."reef_id" AS "reef_id",
          "time_series"."poi_id" AS "poi_id"
        FROM "time_series" "time_series"
        INNER JOIN "metrics" "metric" ON "metric"."id" = metric_id
        INNER JOIN "sources" "source" ON "source"."id" = source_id
        ORDER BY reef_id, poi_id, metric_id, source_id, timestamp DESC`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP VIEW "latest_data"`);
    await queryRunner.query(`DROP TABLE "time_series"`);
    await queryRunner.query(`DROP TABLE "metrics"`);
    await queryRunner.query(`DROP TABLE "sources"`);
    await queryRunner.query('DROP TYPE metrics_metric_enum');
    await queryRunner.query('DROP TYPE metrics_units_enum');
    await queryRunner.query(`DROP TYPE "sources_type_enum"`);
  }
}
