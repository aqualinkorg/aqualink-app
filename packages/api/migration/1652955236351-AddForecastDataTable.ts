import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddForecastDataTable1652955236351 implements MigrationInterface {
  name = 'AddForecastDataTable1652955236351';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "forecast_data" ("id" SERIAL NOT NULL, "timestamp" TIMESTAMP NOT NULL, "significant_wave_height" double precision, "mean_direction" double precision, "mean_period" double precision, "wind_speed" double precision, "wind_direction" double precision, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "site_id" integer NOT NULL, CONSTRAINT "one_row_per_site" UNIQUE ("site_id"), CONSTRAINT "PK_95ee099ba4892af55de59d5bc86" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_dcb506094b4d60388888fd81bc" ON "forecast_data" ("timestamp") `,
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
  }
}
