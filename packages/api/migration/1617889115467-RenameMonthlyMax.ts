import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameMonthlyMax1617889115467 implements MigrationInterface {
  name = 'RenameMonthlyMax1617889115467';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "monthly_max" RENAME TO "historical_monthly_mean"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "historical_monthly_mean" RENAME TO "monthly_max"`,
    );
  }
}
