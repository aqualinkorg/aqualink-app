import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddForecastDataTable1653553591156 implements MigrationInterface {
  name = 'AddForecastDataTable1653553591156';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."forecast_data_metric_enum" AS ENUM('temp_alert', 'temp_weekly_alert', 'dhw', 'satellite_temperature', 'air_temperature', 'top_temperature', 'bottom_temperature', 'sst_anomaly', 'significant_wave_height', 'wave_mean_period', 'wave_peak_period', 'wave_mean_direction', 'wind_speed', 'wind_direction', 'cholorophyll_rfu', 'cholorophyll_concentration', 'conductivity', 'water_depth', 'odo_saturation', 'odo_concentration', 'salinity', 'specific_conductance', 'tds', 'turbidity', 'total_suspended_solids', 'sonde_wiper_position', 'ph', 'ph_mv', 'sonde_battery_voltage', 'sonde_cable_power_voltage', 'pressure', 'precipitation', 'rh', 'wind_gust_speed')`,
    );
    await queryRunner.query(
      `CREATE TABLE "forecast_data" ("id" SERIAL NOT NULL, "timestamp" TIMESTAMP NOT NULL, "value" double precision NOT NULL, "metric" "public"."forecast_data_metric_enum" NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "site_id" integer NOT NULL, CONSTRAINT "one_row_per_site_per_metric" UNIQUE ("site_id", "metric"), CONSTRAINT "PK_95ee099ba4892af55de59d5bc86" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_2319fce6c102102ca2f4dae034" ON "forecast_data" ("site_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "forecast_data" ADD CONSTRAINT "FK_2319fce6c102102ca2f4dae0349" FOREIGN KEY ("site_id") REFERENCES "site"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "forecast_data" DROP CONSTRAINT "FK_2319fce6c102102ca2f4dae0349"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_2319fce6c102102ca2f4dae034"`,
    );
    await queryRunner.query(`DROP TABLE "forecast_data"`);
    await queryRunner.query(`DROP TYPE "public"."forecast_data_metric_enum"`);
  }
}
