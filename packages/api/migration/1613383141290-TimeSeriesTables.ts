import { MigrationInterface, QueryRunner } from 'typeorm';

export class TimeSeriesTables1613383141290 implements MigrationInterface {
  name = 'TimeSeriesTables1613383141290';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "metrics_metric_enum" AS ENUM('satellite_temperature', 'surface_temperature', 'bottom_temperature', 'dhw', 'alert', 'sst_anomaly')`,
    );
    await queryRunner.query(
      `CREATE TYPE "metrics_units_enum" AS ENUM('celsius', 'm', 'm/s', 'dhw')`,
    );
    await queryRunner.query(
      `CREATE TABLE "metrics" ("id" SERIAL NOT NULL, "metric" "metrics_metric_enum" NOT NULL, "description" character varying NOT NULL, "units" "metrics_units_enum" NOT NULL, CONSTRAINT "PK_5283cad666a83376e28a715bf0e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "sources_type_enum" AS ENUM('spotter', 'hobo', 'sofar_api')`,
    );
    await queryRunner.query(
      `CREATE TABLE "sources" ("id" SERIAL NOT NULL, "type" "sources_type_enum" NOT NULL, "spotter_id" character varying, "reef_id" integer, CONSTRAINT "PK_85523beafe5a2a6b90b02096443" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "sources" ADD CONSTRAINT "FK_fc8de60fc92ac93f41a52ad01b7" FOREIGN KEY ("reef_id") REFERENCES "reef"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `CREATE TABLE "time_series" ("id" SERIAL NOT NULL, "timestamp" TIMESTAMP NOT NULL, "value" double precision NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "reef_id" integer, "poi_id" integer, "metric_id" integer, "source_id" integer, CONSTRAINT "PK_e472f6a5f5bce1c709008a24fe8" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "time_series" ADD CONSTRAINT "FK_88a659ad442c11d3a5400b3def4" FOREIGN KEY ("reef_id") REFERENCES "reef"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "time_series" ADD CONSTRAINT "FK_97235131108c5dfd9a68150ff8e" FOREIGN KEY ("poi_id") REFERENCES "reef_point_of_interest"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "time_series" ADD CONSTRAINT "FK_769f6576134f6f18b1f23108c45" FOREIGN KEY ("metric_id") REFERENCES "metrics"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "time_series" ADD CONSTRAINT "FK_fb5d7b75a674607b65fa78d5c92" FOREIGN KEY ("source_id") REFERENCES "sources"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `CREATE VIEW "latest_data" AS SELECT DISTINCT ON (metric_id, reef_id, poi_id) "metric"."metric" AS "metric", "time_series"."id" AS "id", timestamp, value, reef_id, poi_id FROM "time_series" "time_series" INNER JOIN "metrics" "metric" ON "metric"."id" = metric_id  ORDER BY reef_id, poi_id, metric_id, timestamp DESC WITH DATA`,
    );
    await queryRunner.query(
      `INSERT INTO "typeorm_metadata"("type", "schema", "name", "value") VALUES ($1, $2, $3, $4)`,
      [
        'VIEW',
        'public',
        'latest_data',
        'SELECT DISTINCT ON (metric_id, reef_id, poi_id) "metric"."metric" AS "metric", "time_series"."id" AS "id", timestamp, value, reef_id, poi_id FROM "time_series" "time_series" INNER JOIN "metrics" "metric" ON "metric"."id" = metric_id  ORDER BY reef_id, poi_id, metric_id, timestamp DESC WITH DATA',
      ],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "typeorm_metadata" WHERE "type" = 'VIEW' AND "schema" = $1 AND "name" = $2`,
      ['public', 'latest_data'],
    );
    await queryRunner.query(`DROP VIEW "latest_data"`);
    await queryRunner.query(
      `ALTER TABLE "time_series" DROP CONSTRAINT "FK_fb5d7b75a674607b65fa78d5c92"`,
    );
    await queryRunner.query(
      `ALTER TABLE "time_series" DROP CONSTRAINT "FK_769f6576134f6f18b1f23108c45"`,
    );
    await queryRunner.query(
      `ALTER TABLE "time_series" DROP CONSTRAINT "FK_97235131108c5dfd9a68150ff8e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "time_series" DROP CONSTRAINT "FK_88a659ad442c11d3a5400b3def4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sources" DROP CONSTRAINT "FK_fc8de60fc92ac93f41a52ad01b7"`,
    );
    await queryRunner.query(`DROP TABLE "time_series"`);
    await queryRunner.query(`DROP TABLE "metrics"`);
    await queryRunner.query(`DROP TYPE "metrics_units_enum"`);
    await queryRunner.query(`DROP TYPE "metrics_metric_enum"`);
    await queryRunner.query(`DROP TABLE "sources"`);
    await queryRunner.query(`DROP TYPE "sources_type_enum"`);
  }
}
