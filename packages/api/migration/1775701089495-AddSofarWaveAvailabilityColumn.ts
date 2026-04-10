import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSofarWaveAvailabilityColumn1775701089495 implements MigrationInterface {
  name = 'AddSofarWaveAvailabilityColumn1775701089495';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "site" ADD "nearest_sofar_wave_location" geometry`,
    );
    await queryRunner.query(
      `ALTER TABLE "site" ADD "nearest_sofar_wind_location" geometry`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "site" DROP COLUMN "nearest_sofar_wind_location"`,
    );
    await queryRunner.query(
      `ALTER TABLE "site" DROP COLUMN "nearest_sofar_wave_location"`,
    );
  }
}
