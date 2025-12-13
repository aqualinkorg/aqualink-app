import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameSeapHOxMetricsPart2UpdateData1734567890125
  implements MigrationInterface
{
  name = 'RenameSeapHOxMetricsPart2UpdateData1734567890125';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Now the enum values from Part 1 are committed and safe to use
    const metricMappings: [string, string][] = [
      ['seaphox_oxygen', 'dissolved_oxygen'],
      ['seaphox_salinity', 'salinity'],
      ['seaphox_conductivity', 'conductivity'],
      ['seaphox_pressure', 'pressure'],
      ['seaphox_external_ph', 'ph'],
      ['seaphox_internal_ph', 'internal_ph'],
      ['seaphox_external_ph_volt', 'external_ph_volt'],
      ['seaphox_internal_ph_volt', 'internal_ph_volt'],
      ['seaphox_ph_temperature', 'ph_temperature'],
      ['seaphox_int_temperature', 'internal_temperature'],
      ['seaphox_relative_humidity', 'relative_humidity'],
      ['seaphox_sample_number', 'sample_number'],
      ['seaphox_error_flags', 'error_flags'],
    ];

    for (const [oldMetric, newMetric] of metricMappings) {
      // Check if there's data with the old metric name
      // FIX: Cast metric column to text (::text) to avoid "invalid input value for enum" error
      const result = await queryRunner.query(`
          SELECT COUNT(*) as count FROM time_series 
          WHERE metric::text = '${oldMetric}'
        `);

      const count = parseInt(result[0].count, 10);

      if (count > 0) {
        console.log(
          `Updating ${count} rows from '${oldMetric}' to '${newMetric}'`,
        );

        // FIX: Cast metric column to text in the WHERE clause here as well
        await queryRunner.query(`
            UPDATE time_series 
            SET metric = '${newMetric}'::time_series_metric_enum
            WHERE metric::text = '${oldMetric}'
          `);
      } else {
        console.log(`No data found for '${oldMetric}', skipping`);
      }
    }

    console.log(
      'Migration complete. Note: seaphox_temperature remains unchanged.',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Reverse the mappings to roll back
    const metricMappings: [string, string][] = [
      ['dissolved_oxygen', 'seaphox_oxygen'],
      ['salinity', 'seaphox_salinity'],
      ['conductivity', 'seaphox_conductivity'],
      ['pressure', 'seaphox_pressure'],
      ['ph', 'seaphox_external_ph'],
      ['internal_ph', 'seaphox_internal_ph'],
      ['external_ph_volt', 'seaphox_external_ph_volt'],
      ['internal_ph_volt', 'seaphox_internal_ph_volt'],
      ['ph_temperature', 'seaphox_ph_temperature'],
      ['internal_temperature', 'seaphox_int_temperature'],
      ['relative_humidity', 'seaphox_relative_humidity'],
      ['sample_number', 'seaphox_sample_number'],
      ['error_flags', 'seaphox_error_flags'],
    ];

    // Only revert the SeapHOx data (from spotter source at SeapHOx sites)
    for (const [newMetric, oldMetric] of metricMappings) {
      await queryRunner.query(`
        UPDATE time_series 
        SET metric = '${oldMetric}'::time_series_metric_enum
        WHERE metric::text = '${newMetric}'
        AND source_id IN (
          SELECT id FROM sources 
          WHERE type = 'spotter' 
          AND site_id IN (
            SELECT id FROM site WHERE has_seaphox = true
          )
        )
      `);
    }
  }
}
