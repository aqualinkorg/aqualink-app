import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSourceToForecastData1654159594680
  implements MigrationInterface
{
  name = 'AddSourceToForecastData1654159594680';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "forecast_data" ADD "source" "public"."sources_type_enum" NULL`,
    );
    await queryRunner.query(
      `UPDATE "forecast_data" SET "source"='sofar_wave_model'`,
    );
    await queryRunner.query(
      `ALTER TABLE "forecast_data" ALTER COLUMN "source" SET NOT NULL;`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "forecast_data" DROP COLUMN "source"`);
  }
}
