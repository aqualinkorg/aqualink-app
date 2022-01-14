import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeDataUploadRelations1642096825803
  implements MigrationInterface
{
  name = 'ChangeDataUploadRelations1642096825803';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "data_uploads" DROP CONSTRAINT "FK_a0eaf4da731fb39079b1fbf9fb9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "data_uploads" DROP CONSTRAINT "FK_1ed4a7be821c5819d382e4b72ee"`,
    );
    await queryRunner.query(
      `ALTER TABLE "data_uploads" ALTER COLUMN "site_id" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "data_uploads" DROP CONSTRAINT "REL_1ed4a7be821c5819d382e4b72e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "data_uploads" ALTER COLUMN "survey_point_id" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "data_uploads" DROP CONSTRAINT "REL_a0eaf4da731fb39079b1fbf9fb"`,
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
    await queryRunner.query(
      `ALTER TABLE "data_uploads" ADD CONSTRAINT "REL_a0eaf4da731fb39079b1fbf9fb" UNIQUE ("survey_point_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "data_uploads" ALTER COLUMN "survey_point_id" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "data_uploads" ADD CONSTRAINT "REL_1ed4a7be821c5819d382e4b72e" UNIQUE ("site_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "data_uploads" ALTER COLUMN "site_id" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "data_uploads" ADD CONSTRAINT "FK_1ed4a7be821c5819d382e4b72ee" FOREIGN KEY ("site_id") REFERENCES "site"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "data_uploads" ADD CONSTRAINT "FK_a0eaf4da731fb39079b1fbf9fb9" FOREIGN KEY ("survey_point_id") REFERENCES "site_survey_point"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
