import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddHWODataSource1779844274411 implements MigrationInterface {
  name = 'AddHWODataSource1779844274411';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."sources_type_enum" ADD VALUE IF NOT EXISTS 'hwo'`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."time_series_metric_enum" ADD VALUE IF NOT EXISTS 'enterococcus'`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."time_series_metric_enum" ADD VALUE IF NOT EXISTS 'turbidity_1'`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."time_series_metric_enum" ADD VALUE IF NOT EXISTS 'turbidity_2'`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."time_series_metric_enum" ADD VALUE IF NOT EXISTS 'turbidity_3'`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."time_series_metric_enum" ADD VALUE IF NOT EXISTS 'turbidity_4'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."sources_type_enum" RENAME TO "sources_type_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."sources_type_enum" AS ENUM('gfs', 'hobo', 'noaa', 'spotter', 'sonde', 'metlog', 'sofar_model', 'hui', 'sheet_data', 'seaphox')`,
    );
    await queryRunner.query(
      `ALTER TABLE "sources" ALTER COLUMN "type" TYPE "public"."sources_type_enum" USING "type"::"text"::"public"."sources_type_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."sources_type_enum_old"`);
  }
}
