import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddEndOfLifeStatusTospotter1675934866004 implements MigrationInterface {
  name = 'AddEndOfLifeStatusTospotter1675934866004';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."site_status_enum" RENAME TO "site_status_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."site_status_enum" AS ENUM('in_review', 'rejected', 'approved', 'shipped', 'deployed', 'maintenance', 'lost', 'end_of_life')`,
    );
    await queryRunner.query(
      `ALTER TABLE "site" ALTER COLUMN "status" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "site" ALTER COLUMN "status" TYPE "public"."site_status_enum" USING "status"::"text"::"public"."site_status_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "site" ALTER COLUMN "status" SET DEFAULT 'in_review'`,
    );
    await queryRunner.query(`DROP TYPE "public"."site_status_enum_old"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."site_status_enum_old" AS ENUM('approved', 'deployed', 'in_review', 'lost', 'maintenance', 'rejected', 'shipped')`,
    );
    await queryRunner.query(
      `ALTER TABLE "site" ALTER COLUMN "status" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "site" ALTER COLUMN "status" TYPE "public"."site_status_enum_old" USING "status"::"text"::"public"."site_status_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "site" ALTER COLUMN "status" SET DEFAULT 'in_review'`,
    );
    await queryRunner.query(`DROP TYPE "public"."site_status_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."site_status_enum_old" RENAME TO "site_status_enum"`,
    );
  }
}
