import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSourceToForecastData1654159594680 implements MigrationInterface {
  name = 'AddSourceToForecastData1654159594680';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "forecast_data" ADD "source" "public"."sources_type_enum" NOT NULL DEFAULT 'sofar_wave_model'`,
    );
    await queryRunner.query(
      `ALTER TABLE "forecast_data" DROP CONSTRAINT "one_row_per_site_per_metric", ADD CONSTRAINT "one_row_per_site_per_metric_per_source"  UNIQUE ("site_id", "metric", "source")`,
    );
  }

  // The table has to be deleted because possible conflicts when "reducing" the constraint
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "forecast_data" WHERE "forecast_data"."id" in (SELECT DISTINCT "a"."id" FROM "forecast_data" as "a" INNER JOIN "forecast_data" as "b" ON "a"."metric"="b"."metric" AND "a"."site_id"="b"."site_id" WHERE "a"."updated_at"<"b"."updated_at")`,
    );
    await queryRunner.query(
      `ALTER TABLE "forecast_data" DROP CONSTRAINT "one_row_per_site_per_metric_per_source", ADD CONSTRAINT "one_row_per_site_per_metric"  UNIQUE ("site_id", "metric")`,
    );
    await queryRunner.query(`ALTER TABLE "forecast_data" DROP COLUMN "source"`);
  }
}
