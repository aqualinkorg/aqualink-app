import { MigrationInterface, QueryRunner } from 'typeorm';

export class addLostSpotterStatusAndInvasiveSpecies1636644741257 implements MigrationInterface {
  name = 'addLostSpotterStatusAndInvasiveSpecies1636644741257';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."survey_media_observations_enum" RENAME TO "survey_media_observations_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "survey_media_observations_enum" AS ENUM('anthropogenic', 'environmental', 'evident-disease', 'healthy', 'invasive-species', 'mortality', 'no-data', 'possible-disease')`,
    );
    await queryRunner.query(
      `ALTER TABLE "survey_media" ALTER COLUMN "observations" TYPE "survey_media_observations_enum" USING "observations"::"text"::"survey_media_observations_enum"`,
    );
    await queryRunner.query(`DROP TYPE "survey_media_observations_enum_old"`);
    await queryRunner.query(
      `ALTER TYPE "public"."site_status_enum" RENAME TO "site_status_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "site_status_enum" AS ENUM('in_review', 'rejected', 'approved', 'shipped', 'deployed', 'maintenance', 'lost')`,
    );
    await queryRunner.query(
      `ALTER TABLE "site" ALTER COLUMN "status" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "site" ALTER COLUMN "status" TYPE "site_status_enum" USING "status"::"text"::"site_status_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "site" ALTER COLUMN "status" SET DEFAULT 'in_review'`,
    );
    await queryRunner.query(`DROP TYPE "site_status_enum_old"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "site_status_enum_old" AS ENUM('in_review', 'rejected', 'approved', 'shipped', 'deployed', 'maintenance')`,
    );
    await queryRunner.query(
      `ALTER TABLE "site" ALTER COLUMN "status" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "site" ALTER COLUMN "status" TYPE "site_status_enum_old" USING "status"::"text"::"site_status_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "site" ALTER COLUMN "status" SET DEFAULT 'in_review'`,
    );
    await queryRunner.query(`DROP TYPE "site_status_enum"`);
    await queryRunner.query(
      `ALTER TYPE "site_status_enum_old" RENAME TO  "site_status_enum"`,
    );
    await queryRunner.query(
      `CREATE TYPE "survey_media_observations_enum_old" AS ENUM('healthy', 'possible-disease', 'evident-disease', 'mortality', 'environmental', 'anthropogenic', 'no-data')`,
    );
    await queryRunner.query(
      `ALTER TABLE "survey_media" ALTER COLUMN "observations" TYPE "survey_media_observations_enum_old" USING "observations"::"text"::"survey_media_observations_enum_old"`,
    );
    await queryRunner.query(`DROP TYPE "survey_media_observations_enum"`);
    await queryRunner.query(
      `ALTER TYPE "survey_media_observations_enum_old" RENAME TO  "survey_media_observations_enum"`,
    );
  }
}
