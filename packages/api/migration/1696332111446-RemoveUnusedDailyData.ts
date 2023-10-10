import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveUnusedDailyData1696332111446 implements MigrationInterface {
  name = 'RemoveUnusedDailyData1696332111446';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "daily_data" DROP COLUMN "min_bottom_temperature"`,
    );
    await queryRunner.query(
      `ALTER TABLE "daily_data" DROP COLUMN "max_bottom_temperature"`,
    );
    await queryRunner.query(
      `ALTER TABLE "daily_data" DROP COLUMN "avg_bottom_temperature"`,
    );
    await queryRunner.query(
      `ALTER TABLE "daily_data" DROP COLUMN "top_temperature"`,
    );
    await queryRunner.query(
      `ALTER TABLE "daily_data" DROP COLUMN "min_wave_height"`,
    );
    await queryRunner.query(
      `ALTER TABLE "daily_data" DROP COLUMN "max_wave_height"`,
    );
    await queryRunner.query(
      `ALTER TABLE "daily_data" DROP COLUMN "avg_wave_height"`,
    );
    await queryRunner.query(
      `ALTER TABLE "daily_data" DROP COLUMN "wave_mean_direction"`,
    );
    await queryRunner.query(
      `ALTER TABLE "daily_data" DROP COLUMN "wave_peak_period"`,
    );
    await queryRunner.query(
      `ALTER TABLE "daily_data" DROP COLUMN "min_wind_speed"`,
    );
    await queryRunner.query(
      `ALTER TABLE "daily_data" DROP COLUMN "max_wind_speed"`,
    );
    await queryRunner.query(
      `ALTER TABLE "daily_data" DROP COLUMN "avg_wind_speed"`,
    );
    await queryRunner.query(
      `ALTER TABLE "daily_data" DROP COLUMN "wind_direction"`,
    );
    await queryRunner.query(
      `ALTER TABLE "daily_data" DROP COLUMN "wave_mean_period"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "daily_data" ADD "wave_mean_period" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "daily_data" ADD "wind_direction" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "daily_data" ADD "avg_wind_speed" double precision`,
    );
    await queryRunner.query(
      `ALTER TABLE "daily_data" ADD "max_wind_speed" double precision`,
    );
    await queryRunner.query(
      `ALTER TABLE "daily_data" ADD "min_wind_speed" double precision`,
    );
    await queryRunner.query(
      `ALTER TABLE "daily_data" ADD "wave_peak_period" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "daily_data" ADD "wave_mean_direction" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "daily_data" ADD "avg_wave_height" double precision`,
    );
    await queryRunner.query(
      `ALTER TABLE "daily_data" ADD "max_wave_height" double precision`,
    );
    await queryRunner.query(
      `ALTER TABLE "daily_data" ADD "min_wave_height" double precision`,
    );
    await queryRunner.query(
      `ALTER TABLE "daily_data" ADD "top_temperature" double precision`,
    );
    await queryRunner.query(
      `ALTER TABLE "daily_data" ADD "avg_bottom_temperature" double precision`,
    );
    await queryRunner.query(
      `ALTER TABLE "daily_data" ADD "max_bottom_temperature" double precision`,
    );
    await queryRunner.query(
      `ALTER TABLE "daily_data" ADD "min_bottom_temperature" double precision`,
    );
  }
}
