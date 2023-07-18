import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakeManyToManySiteDataUploadsRelation1689689684103
  implements MigrationInterface
{
  name = 'MakeManyToManySiteDataUploadsRelation1689689684103';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "data_uploads" DROP CONSTRAINT "FK_1ed4a7be821c5819d382e4b72ee"`,
    );
    await queryRunner.query(
      `ALTER TABLE "data_uploads" DROP CONSTRAINT "FK_a0eaf4da731fb39079b1fbf9fb9"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_1ed4a7be821c5819d382e4b72e"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_a0eaf4da731fb39079b1fbf9fb"`,
    );
    await queryRunner.query(
      `CREATE TABLE "data_uploads_sites_site" ("data_uploads_id" integer NOT NULL, "site_id" integer NOT NULL, CONSTRAINT "PK_183ef860a9d3c405abccc78fc4e" PRIMARY KEY ("data_uploads_id", "site_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_57711cd4db7131f91b51caf037" ON "data_uploads_sites_site" ("data_uploads_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_8d15d17871321852b508a15d00" ON "data_uploads_sites_site" ("site_id") `,
    );
    await queryRunner.query(`ALTER TABLE "data_uploads" DROP COLUMN "site_id"`);
    await queryRunner.query(
      `ALTER TABLE "data_uploads" DROP COLUMN "survey_point_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "data_uploads_sites_site" ADD CONSTRAINT "FK_57711cd4db7131f91b51caf0377" FOREIGN KEY ("data_uploads_id") REFERENCES "data_uploads"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "data_uploads_sites_site" ADD CONSTRAINT "FK_8d15d17871321852b508a15d00e" FOREIGN KEY ("site_id") REFERENCES "site"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "data_uploads_sites_site" DROP CONSTRAINT "FK_8d15d17871321852b508a15d00e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "data_uploads_sites_site" DROP CONSTRAINT "FK_57711cd4db7131f91b51caf0377"`,
    );
    await queryRunner.query(
      `ALTER TABLE "data_uploads" ADD "survey_point_id" integer`,
    );
    await queryRunner.query(`ALTER TABLE "data_uploads" ADD "site_id" integer`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_8d15d17871321852b508a15d00"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_57711cd4db7131f91b51caf037"`,
    );
    await queryRunner.query(`DROP TABLE "data_uploads_sites_site"`);
    await queryRunner.query(
      `CREATE INDEX "IDX_a0eaf4da731fb39079b1fbf9fb" ON "data_uploads" ("survey_point_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_1ed4a7be821c5819d382e4b72e" ON "data_uploads" ("site_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "data_uploads" ADD CONSTRAINT "FK_a0eaf4da731fb39079b1fbf9fb9" FOREIGN KEY ("survey_point_id") REFERENCES "site_survey_point"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "data_uploads" ADD CONSTRAINT "FK_1ed4a7be821c5819d382e4b72ee" FOREIGN KEY ("site_id") REFERENCES "site"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
