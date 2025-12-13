import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameSeapHOxMetricsPart1AddEnums1734567890124
  implements MigrationInterface
{
  name = 'RenameSeapHOxMetricsPart1AddEnums1734567890124';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ONLY add new enum values - don't use them yet
    const newMetrics = [
      'dissolved_oxygen',
      'internal_ph',
      'external_ph_volt',
      'internal_ph_volt',
      'ph_temperature',
      'internal_temperature',
      'relative_humidity',
      'sample_number',
      'error_flags',
    ];

    for (const metric of newMetrics) {
      await queryRunner.query(`
        DO $$ 
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_enum 
            WHERE enumlabel = '${metric}' 
            AND enumtypid = 'time_series_metric_enum'::regtype
          ) THEN
            ALTER TYPE time_series_metric_enum ADD VALUE '${metric}';
          END IF;
        END $$;
      `);
    }

    console.log(
      'Added new enum values. They will be available after this transaction commits.',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Can't remove enum values easily in PostgreSQL
    console.log('Cannot remove enum values - this is a PostgreSQL limitation');
  }
}
