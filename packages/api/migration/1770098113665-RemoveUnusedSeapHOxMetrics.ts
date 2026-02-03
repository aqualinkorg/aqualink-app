import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveUnusedSeapHOxMetrics1770100000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Remove unused SeapHOx metrics from enum
    await queryRunner.query(`
      DELETE FROM pg_enum
      WHERE enumlabel IN ('sample_number', 'error_flags')
        AND enumtypid = 'time_series_metric_enum'::regtype;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TYPE time_series_metric_enum ADD VALUE IF NOT EXISTS 'sample_number';
    `);
    await queryRunner.query(`
      ALTER TYPE time_series_metric_enum ADD VALUE IF NOT EXISTS 'error_flags';
    `);
  }
}
