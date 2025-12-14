import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDataUploadsTable1642753781389 implements MigrationInterface {
  name = 'AddDataUploadsTable1642753781389';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "data_uploads" ("id" SERIAL NOT NULL, "sensor_type" "public"."sources_type_enum" NOT NULL, "file" character varying NOT NULL, "signature" character varying NOT NULL, "min_date" TIMESTAMP NOT NULL, "max_date" TIMESTAMP NOT NULL, "metrics" character varying array NOT NULL, "site_id" integer NOT NULL, "survey_point_id" integer NOT NULL, CONSTRAINT "PK_9ef709a27488ea390dd90ded05a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "data_uploads" ADD CONSTRAINT "FK_1ed4a7be821c5819d382e4b72ee" FOREIGN KEY ("site_id") REFERENCES "site"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "data_uploads" ADD CONSTRAINT "FK_a0eaf4da731fb39079b1fbf9fb9" FOREIGN KEY ("survey_point_id") REFERENCES "site_survey_point"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "data_uploads" DROP CONSTRAINT "FK_a0eaf4da731fb39079b1fbf9fb9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "data_uploads" DROP CONSTRAINT "FK_1ed4a7be821c5819d382e4b72ee"`,
    );
    await queryRunner.query(`DROP TABLE "data_uploads"`);
  }
}
