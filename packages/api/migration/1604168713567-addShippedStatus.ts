import { MigrationInterface, QueryRunner } from 'typeorm';

export class addShippedStatus1604168713567 implements MigrationInterface {
  name = 'addShippedStatus1604168713567';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."reef_status_enum" ADD VALUE 'shipped'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "reef_status_enum_old" AS ENUM('in_review', 'rejected', 'approved')`,
    );
    await queryRunner.query(
      `UPDATE "reef" SET "status"='in_review' WHERE "status"='shipped'`,
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
