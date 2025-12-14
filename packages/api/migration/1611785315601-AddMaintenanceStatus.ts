import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMaintenanceStatus1611785315601 implements MigrationInterface {
  name = 'AddMaintenanceStatus1611785315601';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."reef_status_enum" RENAME TO "reef_status_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "reef_status_enum" AS ENUM('in_review', 'rejected', 'approved', 'shipped', 'deployed', 'maintenance')`,
    );
    await queryRunner.query(
      `ALTER TABLE "reef" ALTER COLUMN "status" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "reef" ALTER COLUMN "status" TYPE "reef_status_enum" USING "status"::"text"::"reef_status_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "reef" ALTER COLUMN "status" SET DEFAULT 'in_review'`,
    );
    await queryRunner.query(`DROP TYPE "reef_status_enum_old"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "reef_status_enum_old" AS ENUM('in_review', 'rejected', 'approved', 'shipped', 'deployed')`,
    );
    await queryRunner.query(
      `ALTER TABLE "reef" ALTER COLUMN "status" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "reef" ALTER COLUMN "status" TYPE "reef_status_enum_old" USING "status"::"text"::"reef_status_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "reef" ALTER COLUMN "status" SET DEFAULT 'in_review'`,
    );
    await queryRunner.query(`DROP TYPE "reef_status_enum"`);
    await queryRunner.query(
      `ALTER TYPE "reef_status_enum_old" RENAME TO  "reef_status_enum"`,
    );
  }
}
