import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakeManyToManySiteDataUploadsRelation1690467999203
  implements MigrationInterface
{
  name = 'MakeManyToManySiteDataUploadsRelation1690467999203';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "data_uploads" DROP CONSTRAINT "FK_1ed4a7be821c5819d382e4b72ee"`,
    );
    await queryRunner.query(
      `ALTER TABLE "data_uploads" DROP CONSTRAINT "FK_a0eaf4da731fb39079b1fbf9fb9"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_a0eaf4da731fb39079b1fbf9fb"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_1ed4a7be821c5819d382e4b72e"`,
    );
    await queryRunner.query(
      `CREATE TABLE "data_uploads_sites" ("site_id" integer NOT NULL, "data_upload_id" integer NOT NULL, "survey_point_id" integer, CONSTRAINT "PK_6515b1d83e2075084dc02057a22" PRIMARY KEY ("site_id", "data_upload_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_9788850820bf6b28b8bcf18aab" ON "data_uploads_sites" ("site_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_fc03fec1cc91193fddbe21ca14" ON "data_uploads_sites" ("data_upload_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_9b7753518e6f82ff4c679de966" ON "data_uploads_sites" ("survey_point_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "data_uploads" DROP COLUMN "sensor_type"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."data_uploads_sensor_type_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "data_uploads" DROP COLUMN "survey_point_id"`,
    );
    await queryRunner.query(`ALTER TABLE "data_uploads" DROP COLUMN "site_id"`);
    await queryRunner.query(
      `ALTER TABLE "data_uploads" ADD "sensor_types" character varying array`,
    );
    await queryRunner.query(
      `ALTER TABLE "data_uploads_sites" ADD CONSTRAINT "FK_9788850820bf6b28b8bcf18aabe" FOREIGN KEY ("site_id") REFERENCES "site"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "data_uploads_sites" ADD CONSTRAINT "FK_fc03fec1cc91193fddbe21ca145" FOREIGN KEY ("data_upload_id") REFERENCES "data_uploads"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "data_uploads_sites" ADD CONSTRAINT "FK_9b7753518e6f82ff4c679de9666" FOREIGN KEY ("survey_point_id") REFERENCES "site_survey_point"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "data_uploads_sites" DROP CONSTRAINT "FK_9b7753518e6f82ff4c679de9666"`,
    );
    await queryRunner.query(
      `ALTER TABLE "data_uploads_sites" DROP CONSTRAINT "FK_fc03fec1cc91193fddbe21ca145"`,
    );
    await queryRunner.query(
      `ALTER TABLE "data_uploads_sites" DROP CONSTRAINT "FK_9788850820bf6b28b8bcf18aabe"`,
    );
    await queryRunner.query(
      `ALTER TABLE "data_uploads" DROP COLUMN "sensor_types"`,
    );
    await queryRunner.query(`ALTER TABLE "data_uploads" ADD "site_id" integer`);
    await queryRunner.query(
      `ALTER TABLE "data_uploads" ADD "survey_point_id" integer`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."data_uploads_sensor_type_enum" AS ENUM('gfs', 'hobo', 'hui', 'metlog', 'noaa', 'sheet_data', 'sofar_model', 'sonde', 'spotter')`,
    );
    await queryRunner.query(
      `ALTER TABLE "data_uploads" ADD "sensor_type" "public"."data_uploads_sensor_type_enum" NOT NULL`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_9b7753518e6f82ff4c679de966"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_fc03fec1cc91193fddbe21ca14"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_9788850820bf6b28b8bcf18aab"`,
    );
    await queryRunner.query(`DROP TABLE "data_uploads_sites"`);
    await queryRunner.query(
      `CREATE INDEX "IDX_1ed4a7be821c5819d382e4b72e" ON "data_uploads" ("site_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a0eaf4da731fb39079b1fbf9fb" ON "data_uploads" ("survey_point_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "data_uploads" ADD CONSTRAINT "FK_a0eaf4da731fb39079b1fbf9fb9" FOREIGN KEY ("survey_point_id") REFERENCES "site_survey_point"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "data_uploads" ADD CONSTRAINT "FK_1ed4a7be821c5819d382e4b72ee" FOREIGN KEY ("site_id") REFERENCES "site"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
