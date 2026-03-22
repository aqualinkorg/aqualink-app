import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSeapHOxMetrics1765217580487
  implements MigrationInterface
{
  name = 'AddSeapHOxMetrics1765217580487';

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

    // Add seaphox as a source type
    await queryRunner.query(
      `ALTER TYPE "public"."sources_type_enum" ADD VALUE IF NOT EXISTS 'seaphox'`,
    );

    // Add SeapHOx metrics to time_series_metric_enum
    const metrics = [
      'dissolved_oxygen',
      'internal_ph',
      'external_ph_volt',
      'internal_ph_volt',
      'ph_temperature',
      'internal_temperature',
      'relative_humidity',
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
    // Remove columns
    await queryRunner.query(`
      ALTER TABLE "site" DROP COLUMN IF EXISTS "has_seaphox"
    `);

    await queryRunner.query(`
      ALTER TABLE "site" DROP COLUMN IF EXISTS "bristlemouth_node_id"
    `);
  }
}

