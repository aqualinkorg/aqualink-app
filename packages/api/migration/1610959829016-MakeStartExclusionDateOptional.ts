import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakeStartExclusionDateOptional1610959829016 implements MigrationInterface {
  name = 'MakeStartExclusionDateOptional1610959829016';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "exclusion_dates" DROP CONSTRAINT "no_duplicates_start_date"`,
    );
    await queryRunner.query(
      `ALTER TABLE "exclusion_dates" DROP CONSTRAINT "no_duplicate_end_date"`,
    );
    await queryRunner.query(
      `ALTER TABLE "exclusion_dates" ALTER COLUMN "start_date" DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "exclusion_dates" ALTER COLUMN "start_date" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "exclusion_dates" ADD CONSTRAINT "no_duplicates_start_date" UNIQUE ("spotter_id", "start_date")`,
    );
    await queryRunner.query(
      `ALTER TABLE "exclusion_dates" ADD CONSTRAINT "no_duplicate_end_date" UNIQUE ("spotter_id", "end_date")`,
    );
  }
}
