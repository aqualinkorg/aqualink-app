import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddForecastDataTable1653036340061 implements MigrationInterface {
  name = 'AddForecastDataTable1653036340061';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."forecast_data_metric_enum" AS ENUM('significant_wave_height', 'wave_mean_direction', 'wave_mean_period', 'wind_speed', 'wind_direction')`,
    );
    await queryRunner.query(
      `CREATE TABLE "forecast_data" ("id" SERIAL NOT NULL, "timestamp" TIMESTAMP NOT NULL, "value" double precision NOT NULL, "metric" "public"."forecast_data_metric_enum" NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "site_id" integer NOT NULL, CONSTRAINT "one_row_per_site_per_metric" UNIQUE ("site_id", "metric"), CONSTRAINT "PK_95ee099ba4892af55de59d5bc86" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_dcb506094b4d60388888fd81bc" ON "forecast_data" ("site_id") `,
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
      `DROP INDEX "public"."IDX_dcb506094b4d60388888fd81bc"`,
    );
    await queryRunner.query(`DROP TABLE "forecast_data"`);
    await queryRunner.query(`DROP TYPE "public"."forecast_data_metric_enum"`);
  }
}
