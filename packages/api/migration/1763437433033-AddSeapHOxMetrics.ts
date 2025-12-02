import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSeapHOxMetrics1763437433033 implements MigrationInterface {
  name = 'AddSeapHOxMetrics1763437433033';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add bristlemouth_node_id column to site table
    await queryRunner.query(`
      ALTER TABLE "site" 
      ADD COLUMN IF NOT EXISTS "bristlemouth_node_id" character varying(50)
    `);

    // Add has_seaphox column to site table
    await queryRunner.query(`
      ALTER TABLE "site" 
      ADD COLUMN IF NOT EXISTS "has_seaphox" boolean DEFAULT false
    `);

    // Add SeapHOx metrics to time_series_metric_enum
    const metrics = [
      'seaphox_temperature',
      'seaphox_external_ph',
      'seaphox_internal_ph',
      'seaphox_external_ph_volt',
      'seaphox_internal_ph_volt',
      'seaphox_ph_temperature',
      'seaphox_pressure',
      'seaphox_salinity',
      'seaphox_conductivity',
      'seaphox_oxygen',
      'seaphox_relative_humidity',
      'seaphox_sample_number',
      'seaphox_error_flags',
      'seaphox_int_temperature',
    ];

    for (const metric of metrics) {
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
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove columns (metrics can't be removed from enums easily)
    await queryRunner.query(`
      ALTER TABLE "site" DROP COLUMN IF EXISTS "has_seaphox"
    `);

    await queryRunner.query(`
      ALTER TABLE "site" DROP COLUMN IF EXISTS "bristlemouth_node_id"
    `);
  }
}