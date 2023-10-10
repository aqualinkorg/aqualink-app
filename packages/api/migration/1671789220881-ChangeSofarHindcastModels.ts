import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeSofarHindcastModels1671789220881
  implements MigrationInterface
{
  name = 'ChangeSofarHindcastModels1671789220881';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."data_uploads_sensor_type_enum" RENAME VALUE 'sofar_wave_model' TO 'sofar_model'`,
    );

    await queryRunner.query(
      `ALTER TYPE "public"."sources_type_enum" RENAME VALUE 'sofar_wave_model' TO 'sofar_model'`,
    );

    await queryRunner.query(
      `ALTER TABLE "forecast_data" DROP CONSTRAINT "one_row_per_site_per_metric_per_source"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."forecast_data_source_enum" RENAME VALUE 'sofar_wave_model' TO 'sofar_model'`,
    );
    await queryRunner.query(
      `ALTER TABLE "forecast_data" ADD CONSTRAINT "one_row_per_site_per_metric_per_source" UNIQUE ("site_id", "metric", "source")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "forecast_data" DROP CONSTRAINT "one_row_per_site_per_metric_per_source"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."forecast_data_source_enum" RENAME VALUE 'sofar_model' TO 'sofar_wave_model'`,
    );
    await queryRunner.query(
      `ALTER TABLE "forecast_data" ADD CONSTRAINT "one_row_per_site_per_metric_per_source" UNIQUE ("metric", "site_id", "source")`,
    );

    await queryRunner.query(
      `ALTER TYPE "public"."sources_type_enum" RENAME VALUE 'sofar_model' TO 'sofar_wave_model'`,
    );

    await queryRunner.query(
      `ALTER TYPE "public"."data_uploads_sensor_type_enum" RENAME VALUE 'sofar_model' TO 'sofar_wave_model'`,
    );
  }
}
