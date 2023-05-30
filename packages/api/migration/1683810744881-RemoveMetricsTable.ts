import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveMetricsTable1683810744881 implements MigrationInterface {
  name = 'RemoveMetricsTable1683810744881';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "metrics"`);
    await queryRunner.query(`DROP TYPE "public"."metrics_metric_enum"`);
    await queryRunner.query(`DROP TYPE "public"."metrics_units_enum"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."metrics_units_enum" AS ENUM('celsius', 'm', 'm/s', 'dhw', 'hPa')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."metrics_metric_enum" AS ENUM('temp_alert', 'temp_weekly_alert', 'dhw', 'satellite_temperature', 'air_temperature', 'top_temperature', 'bottom_temperature', 'sst_anomaly', 'significant_wave_height', 'wave_mean_period', 'wave_peak_period', 'wave_mean_direction', 'wind_speed', 'wind_direction', 'barometric_pressure_top', 'barometric_pressure_top_diff', 'barometric_pressure_bottom', 'cholorophyll_rfu', 'cholorophyll_concentration', 'conductivity', 'water_depth', 'odo_saturation', 'odo_concentration', 'salinity', 'specific_conductance', 'tds', 'turbidity', 'total_suspended_solids', 'sonde_wiper_position', 'ph', 'ph_mv', 'sonde_battery_voltage', 'sonde_cable_power_voltage', 'pressure', 'precipitation', 'rh', 'wind_gust_speed', 'nitrogen_total', 'phosphorus_total', 'phosphorus', 'silicate', 'nitrate_plus_nitrite', 'ammonium')`,
    );
    await queryRunner.query(
      `CREATE TABLE public.metrics (
        id serial4 NOT NULL,
        metric public.metrics_metric_enum NOT NULL,
        description varchar NULL,
        units public.metrics_units_enum NULL,
        CONSTRAINT "PK_5283cad666a83376e28a715bf0e" PRIMARY KEY (id)
      );`,
    );
  }
}
