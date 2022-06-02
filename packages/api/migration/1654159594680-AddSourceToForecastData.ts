import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSourceToForecastData1654159594680
  implements MigrationInterface
{
  name = 'AddSourceToForecastData1654159594680';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "forecast_data" ADD "source" "public"."sources_type_enum" NULL`,
    );
    // When the column is created it will get the value of 'sofar_wave_model'. This will be overwritten by next update, to the correct value.
    await queryRunner.query(
      `UPDATE "forecast_data" SET "source"='sofar_wave_model'`,
    );
    await queryRunner.query(
      `ALTER TABLE "forecast_data" ALTER COLUMN "source" SET NOT NULL;`,
    );
    await queryRunner.query(
      `ALTER TABLE "forecast_data" DROP CONSTRAINT "one_row_per_site_per_metric", ADD CONSTRAINT "one_row_per_site_per_metric"  UNIQUE ("site_id", "metric", "source")`,
    );
  }

  // The table has to be deleted because possible conflicts when "reducing" the constraint
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "forecast_data" DROP CONSTRAINT "FK_2319fce6c102102ca2f4dae0349"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_2319fce6c102102ca2f4dae034"`,
    );
    await queryRunner.query(`DROP TABLE "forecast_data"`);
    await queryRunner.query(
      `CREATE TABLE "forecast_data" ("id" SERIAL NOT NULL, "timestamp" TIMESTAMP NOT NULL, "value" double precision NOT NULL, "metric" "public"."metrics_metric_enum" NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "site_id" integer NOT NULL, CONSTRAINT "one_row_per_site_per_metric" UNIQUE ("site_id", "metric"), CONSTRAINT "PK_95ee099ba4892af55de59d5bc86" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_2319fce6c102102ca2f4dae034" ON "forecast_data" ("site_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "forecast_data" ADD CONSTRAINT "FK_2319fce6c102102ca2f4dae0349" FOREIGN KEY ("site_id") REFERENCES "site"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
