// Changed: 10/25/2025
// Purpose: Add SeapHOx support to database (metrics, source types, and source entries)
//
// HOW TO RUN THIS MIGRATION:
// The migration ONLY runs when you execute: npm run typeorm migration:run
//
// To revert: npm run typeorm migration:revert
//
// Generated timestamp: 1729872000000 (for migration ordering)
//
// See file DATABASE_CHANGES_LOG.md. Can be found locally on Caesar's desktop

import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSeapHOxSupport implements MigrationInterface {
  name = 'AddSeapHOxSupport';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // CHANGE 1: Add 'seaphox' to sources_type_enum
    // This allows the sources table to have type = 'seaphox'
    await queryRunner.query(`
      ALTER TYPE sources_type_enum ADD VALUE IF NOT EXISTS 'seaphox';
    `);

    // CHANGE 2: Add all SeapHOx metrics to time_series_metric_enum
    // This allows the time_series table to store SeapHOx measurements
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
        ALTER TYPE time_series_metric_enum ADD VALUE IF NOT EXISTS '${metric}';
      `);
    }

    // CHANGE 3: Create seaphox sources for sites that have SeapHOx sensors
    // Note: Uses sensor_id (Spotter ID), not bristlemouth_node_id
    // This is because SeapHOx data comes through the Spotter
    // Note: this can also be added manually be adding a row to the table sources.
    await queryRunner.query(`
      INSERT INTO sources (site_id, type, sensor_id, created_at, updated_at)
      SELECT 
          id as site_id,
          'seaphox' as type,
          sensor_id as sensor_id,
          NOW() as created_at,
          NOW() as updated_at
      FROM site
      WHERE has_seaphox = true
        AND sensor_id IS NOT NULL
        AND NOT EXISTS (
          SELECT 1 FROM sources 
          WHERE sources.site_id = site.id 
          AND sources.type = 'seaphox'
        );
    `);

    console.log('✅ SeapHOx support added successfully');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Rollback: Remove the seaphox sources we created
    // Note: PostgreSQL doesn't allow removing enum values easily, so they remain
    await queryRunner.query(`
      DELETE FROM sources WHERE type = 'seaphox';
    `);

    console.log('✅ SeapHOx sources removed');
  }
}
