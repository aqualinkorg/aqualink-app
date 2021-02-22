import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNoDataOption1613988068384 implements MigrationInterface {
  name = 'AddNoDataOption1613988068384';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."survey_media_observations_enum" ADD VALUE 'no-data'`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."survey_weather_conditions_enum" ADD VALUE 'no-data'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "survey_weather_conditions_enum_old" AS ENUM('calm', 'waves', 'storm')`,
    );
    await queryRunner.query(
      `ALTER TABLE "survey" ALTER COLUMN "weather_conditions" TYPE "survey_weather_conditions_enum_old" USING "weather_conditions"::"text"::"survey_weather_conditions_enum_old"`,
    );
    await queryRunner.query(`DROP TYPE "survey_weather_conditions_enum"`);
    await queryRunner.query(
      `ALTER TYPE "survey_weather_conditions_enum_old" RENAME TO  "survey_weather_conditions_enum"`,
    );
    await queryRunner.query(
      `CREATE TYPE "survey_media_observations_enum_old" AS ENUM('healthy', 'possible-disease', 'evident-disease', 'mortality', 'environmental', 'anthropogenic')`,
    );
    await queryRunner.query(
      `ALTER TABLE "survey_media" ALTER COLUMN "observations" TYPE "survey_media_observations_enum_old" USING "observations"::"text"::"survey_media_observations_enum_old"`,
    );
    await queryRunner.query(`DROP TYPE "survey_media_observations_enum"`);
    await queryRunner.query(
      `ALTER TYPE "survey_media_observations_enum_old" RENAME TO  "survey_media_observations_enum"`,
    );
  }
}
