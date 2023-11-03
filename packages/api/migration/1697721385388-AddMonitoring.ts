import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMonitoring1697721385388 implements MigrationInterface {
  name = 'AddMonitoring1697721385388';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."monitoring_metric_enum" AS ENUM('time_series_request', 'csv_download')`,
    );
    await queryRunner.query(
      `CREATE TABLE "monitoring" ("id" SERIAL NOT NULL, "metric" "public"."monitoring_metric_enum" NOT NULL, "timestamp" TIMESTAMP NOT NULL DEFAULT now(), "user_id" integer, "site_id" integer NOT NULL, CONSTRAINT "PK_22a9f9562020245a98bd2c4fb3c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_3f5e1e7b818a474e977bd83e00" ON "monitoring" ("user_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e0d5564ebe31c87c5d3b7d16b4" ON "monitoring" ("site_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_0563c6eef80f470c5f2dd9100c" ON "monitoring" ("timestamp") `,
    );
    await queryRunner.query(
      `ALTER TABLE "monitoring" ADD CONSTRAINT "FK_3f5e1e7b818a474e977bd83e006" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "monitoring" ADD CONSTRAINT "FK_e0d5564ebe31c87c5d3b7d16b4d" FOREIGN KEY ("site_id") REFERENCES "site"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "monitoring" DROP CONSTRAINT "FK_e0d5564ebe31c87c5d3b7d16b4d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "monitoring" DROP CONSTRAINT "FK_3f5e1e7b818a474e977bd83e006"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_0563c6eef80f470c5f2dd9100c"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_e0d5564ebe31c87c5d3b7d16b4"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_3f5e1e7b818a474e977bd83e00"`,
    );
    await queryRunner.query(`DROP TABLE "monitoring"`);
    await queryRunner.query(`DROP TYPE "public"."monitoring_metric_enum"`);
  }
}
